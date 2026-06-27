#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_init_and_campaign_count() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    assert_eq!(client.get_campaign_count(), 0);
}

#[test]
fn test_create_campaign() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();

    let id = client.create_campaign(
        &String::from_str(&env, "Help Kids"),
        &String::from_str(&env, "Donate to help children"),
        &1000i128,
    );
    assert_eq!(id, 1);
    assert_eq!(client.get_campaign_count(), 1);

    let campaign = client.get_campaign(&1);
    assert_eq!(campaign.title, String::from_str(&env, "Help Kids"));
    assert_eq!(campaign.goal, 1000i128);
    assert_eq!(campaign.raised, 0);
    assert!(campaign.active);
}

#[test]
fn test_donate() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.create_campaign(
        &String::from_str(&env, "School Fund"),
        &String::from_str(&env, "Build a school"),
        &5000i128,
    );

    let donor = Address::generate(&env);
    client.donate(&1, &donor, &500i128);

    let campaign = client.get_campaign(&1);
    assert_eq!(campaign.raised, 500);
    assert_eq!(campaign.donor_count, 1);

    let donors = client.get_donors(&1);
    assert_eq!(donors.len(), 1);
    assert_eq!(donors.get(0).unwrap().amount, 500);
    assert_eq!(donors.get(0).unwrap().donor, donor);
}

#[test]
fn test_multiple_donations() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.create_campaign(
        &String::from_str(&env, "Medical Aid"),
        &String::from_str(&env, "Help sick patients"),
        &10000i128,
    );

    let donor1 = Address::generate(&env);
    let donor2 = Address::generate(&env);
    let donor3 = Address::generate(&env);

    client.donate(&1, &donor1, &1000i128);
    client.donate(&1, &donor2, &2000i128);
    client.donate(&1, &donor3, &1500i128);

    let campaign = client.get_campaign(&1);
    assert_eq!(campaign.raised, 4500);
    assert_eq!(campaign.donor_count, 3);

    let donors = client.get_donors(&1);
    assert_eq!(donors.len(), 3);
}

#[test]
fn test_multiple_campaigns() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();

    client.create_campaign(
        &String::from_str(&env, "Campaign A"),
        &String::from_str(&env, "First campaign"),
        &1000i128,
    );
    client.create_campaign(
        &String::from_str(&env, "Campaign B"),
        &String::from_str(&env, "Second campaign"),
        &2000i128,
    );

    assert_eq!(client.get_campaign_count(), 2);

    let campaigns = client.get_all_campaigns();
    assert_eq!(campaigns.len(), 2);
    assert_eq!(campaigns.get(0).unwrap().id, 1);
    assert_eq!(campaigns.get(1).unwrap().id, 2);
}

#[test]
#[should_panic(expected = "campaign not found")]
fn test_get_nonexistent_campaign() {
    let env = Env::default();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.get_campaign(&99);
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn test_donate_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.create_campaign(
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Desc"),
        &100i128,
    );

    let donor = Address::generate(&env);
    client.donate(&1, &donor, &0i128);
}

#[test]
fn test_donate_requires_auth() {
    let env = Env::default();
    // No mock_all_auths — will fail

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.create_campaign(
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Desc"),
        &100i128,
    );

    let donor = Address::generate(&env);
    let result = client.try_donate(&1, &donor, &50i128);
    assert!(result.is_err());
}

#[test]
fn test_donors_in_order() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.create_campaign(
        &String::from_str(&env, "Test"),
        &String::from_str(&env, "Desc"),
        &1000i128,
    );

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    client.donate(&1, &alice, &100i128);
    client.donate(&1, &bob, &200i128);

    let donors = client.get_donors(&1);
    assert_eq!(donors.len(), 2);
    assert_eq!(donors.get(0).unwrap().donor, alice);
    assert_eq!(donors.get(1).unwrap().donor, bob);
}

#[test]
fn test_campaign_progress() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    client.init();
    client.create_campaign(
        &String::from_str(&env, "Progress Test"),
        &String::from_str(&env, "Test progress"),
        &1000i128,
    );

    let donor = Address::generate(&env);
    client.donate(&1, &donor, &250i128);

    let campaign = client.get_campaign(&1);
    assert_eq!(campaign.goal, 1000);
    assert_eq!(campaign.raised, 250);
    // Progress should be 25%
}
