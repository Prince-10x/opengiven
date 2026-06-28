#![no_std]
use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env, String, Vec};

#[contracttype]
pub enum DataKey {
    Campaign(u64),
    Donors(u64),
    Counter,
    DonorTotal(Address),
    AllDonors,
    AllCampaigns,
}

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub name: String,
    pub goal: i128,
    pub total_raised: i128,
    pub deadline: u64,
    pub admin: Address,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct Donation {
    pub donor: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct DonorInfo {
    pub donor: Address,
    pub total_donated: i128,
}

#[contractevent(data_format = "vec")]
#[derive(Clone)]
pub struct DonationEvent {
    #[topic]
    pub campaign_id: u64,
    pub donor: Address,
    pub amount: i128,
}

#[contract]
pub struct Opengive;

#[contractimpl]
impl Opengive {
    pub fn create_campaign(env: Env, admin: Address, name: String, goal: i128, deadline: u64) -> u64 {
        admin.require_auth();
        let mut counter: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        counter += 1;
        let campaign = Campaign { name, goal, total_raised: 0, deadline, admin, active: true };
        env.storage().persistent().set(&DataKey::Campaign(counter), &campaign);
        env.storage().instance().set(&DataKey::Counter, &counter);
        let mut all: Vec<u64> = env.storage().instance().get(&DataKey::AllCampaigns).unwrap_or(Vec::new(&env));
        all.push_back(counter);
        env.storage().instance().set(&DataKey::AllCampaigns, &all);
        counter
    }

    pub fn donate(env: Env, donor: Address, campaign_id: u64, amount: i128) {
        donor.require_auth();
        let mut campaign: Campaign =
            env.storage().persistent().get(&DataKey::Campaign(campaign_id)).expect("campaign not found");
        assert!(campaign.active, "campaign closed");
        assert!(env.ledger().timestamp() < campaign.deadline, "campaign ended");
        campaign.total_raised += amount;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
        let donation = Donation { donor: donor.clone(), amount, timestamp: env.ledger().timestamp() };
        let mut donors: Vec<Donation> =
            env.storage().persistent().get(&DataKey::Donors(campaign_id)).unwrap_or(Vec::new(&env));
        donors.push_back(donation);
        env.storage().persistent().set(&DataKey::Donors(campaign_id), &donors);
        let total: i128 =
            env.storage().persistent().get(&DataKey::DonorTotal(donor.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::DonorTotal(donor.clone()), &(total + amount));
        let mut all_donors: Vec<Address> =
            env.storage().instance().get(&DataKey::AllDonors).unwrap_or(Vec::new(&env));
        if !all_donors.contains(&donor) {
            all_donors.push_back(donor.clone());
            env.storage().instance().set(&DataKey::AllDonors, &all_donors);
        }
        DonationEvent { campaign_id, donor, amount }.publish(&env);
    }

    pub fn get_campaign(env: Env, campaign_id: u64) -> Campaign {
        env.storage().persistent().get(&DataKey::Campaign(campaign_id)).expect("campaign not found")
    }

    pub fn get_campaign_donors(env: Env, campaign_id: u64) -> Vec<Donation> {
        env.storage().persistent().get(&DataKey::Donors(campaign_id)).unwrap_or(Vec::new(&env))
    }

    pub fn get_leaderboard(env: Env) -> Vec<DonorInfo> {
        let all_donors: Vec<Address> =
            env.storage().instance().get(&DataKey::AllDonors).unwrap_or(Vec::new(&env));
        let mut result: Vec<DonorInfo> = Vec::new(&env);
        for donor in all_donors.iter() {
            let total = env.storage().persistent()
                .get::<_, i128>(&DataKey::DonorTotal(donor.clone())).unwrap_or(0);
            result.push_back(DonorInfo { donor: donor.clone(), total_donated: total });
        }
        result
    }

    pub fn get_campaigns(env: Env) -> Vec<u64> {
        env.storage().instance().get(&DataKey::AllCampaigns).unwrap_or(Vec::new(&env))
    }

    pub fn close_campaign(env: Env, admin: Address, campaign_id: u64) {
        admin.require_auth();
        let mut campaign: Campaign =
            env.storage().persistent().get(&DataKey::Campaign(campaign_id)).expect("campaign not found");
        assert_eq!(campaign.admin, admin, "not authorized");
        campaign.active = false;
        env.storage().persistent().set(&DataKey::Campaign(campaign_id), &campaign);
    }
}

mod test;
