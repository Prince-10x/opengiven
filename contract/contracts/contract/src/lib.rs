#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub goal: i128,
    pub raised: i128,
    pub donor_count: u32,
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
pub enum DataKey {
    Campaign(u64),
    CampaignCount,
    Donors(u64),
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    pub fn init(env: Env) {
        env.storage().instance().set(&DataKey::CampaignCount, &0u64);
    }

    pub fn create_campaign(env: Env, title: String, description: String, goal: i128) -> u64 {
        let mut count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);
        count += 1;

        let campaign = Campaign {
            id: count,
            title,
            description,
            goal,
            raised: 0,
            donor_count: 0,
            active: true,
        };

        env.storage().instance().set(&DataKey::Campaign(count), &campaign);
        env.storage().instance().set(&DataKey::CampaignCount, &count);
        env.storage().instance().set(&DataKey::Donors(count), &Vec::<Donation>::new(&env));

        env.events().publish(
            (Symbol::new(&env, "camp_created"), Symbol::new(&env, "new")),
            (count,),
        );

        count
    }

    pub fn donate(env: Env, campaign_id: u64, donor: Address, amount: i128) {
        donor.require_auth();

        let mut campaign: Campaign = env
            .storage()
            .instance()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found");
        assert!(campaign.active, "campaign not active");
        assert!(amount > 0, "amount must be positive");

        campaign.raised += amount;
        campaign.donor_count += 1;

        let donation = Donation {
            donor: donor.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        };

        let mut donors: Vec<Donation> = env
            .storage()
            .instance()
            .get(&DataKey::Donors(campaign_id))
            .unwrap_or(Vec::<Donation>::new(&env));
        donors.push_back(donation);

        env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);
        env.storage().instance().set(&DataKey::Donors(campaign_id), &donors);

        env.events().publish(
            (symbol_short!("donation"), symbol_short!("received")),
            (campaign_id, donor, amount),
        );
    }

    pub fn get_campaign(env: Env, campaign_id: u64) -> Campaign {
        env.storage()
            .instance()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found")
    }

    pub fn get_all_campaigns(env: Env) -> Vec<Campaign> {
        let count: u64 = env
            .storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0);
        let mut campaigns: Vec<Campaign> = Vec::new(&env);
        for i in 1..=count {
            if let Some(c) = env.storage().instance().get::<_, Campaign>(&DataKey::Campaign(i)) {
                campaigns.push_back(c);
            }
        }
        campaigns
    }

    pub fn get_donors(env: Env, campaign_id: u64) -> Vec<Donation> {
        env.storage()
            .instance()
            .get(&DataKey::Donors(campaign_id))
            .unwrap_or(Vec::<Donation>::new(&env))
    }

    pub fn get_campaign_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::CampaignCount)
            .unwrap_or(0)
    }
}

mod test;
