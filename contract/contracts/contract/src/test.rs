#![cfg(test)]

use super::*;
use soroban_sdk::{Env, String, Address};
use soroban_sdk::testutils::{Address as _, Ledger};

#[test]
fn test_create_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let id = client.create_campaign(
        &admin,
        &String::from_str(&env, "Help Kids"),
        &1_000_000_000i128,
        &(env.ledger().timestamp() + 86400),
    );
    assert_eq!(id, 1);

    let campaign = client.get_campaign(&id);
    assert_eq!(campaign.name, String::from_str(&env, "Help Kids"));
    assert_eq!(campaign.goal, 1_000_000_000);
    assert_eq!(campaign.total_raised, 0);
    assert!(campaign.active);
}

#[test]
fn test_donate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let donor = Address::generate(&env);
    let id = client.create_campaign(
        &admin,
        &String::from_str(&env, "Help Kids"),
        &1_000_000_000i128,
        &(env.ledger().timestamp() + 86400),
    );

    client.donate(&donor, &id, &500_000_000i128);

    let campaign = client.get_campaign(&id);
    assert_eq!(campaign.total_raised, 500_000_000);

    let donors = client.get_campaign_donors(&id);
    assert_eq!(donors.len(), 1);
    assert_eq!(donors.get(0).unwrap().amount, 500_000_000);
}

#[test]
fn test_leaderboard() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let donor1 = Address::generate(&env);
    let donor2 = Address::generate(&env);
    let id = client.create_campaign(
        &admin,
        &String::from_str(&env, "Help Kids"),
        &1_000_000_000i128,
        &(env.ledger().timestamp() + 86400),
    );

    client.donate(&donor1, &id, &300_000_000i128);
    client.donate(&donor2, &id, &500_000_000i128);

    let board = client.get_leaderboard();
    assert_eq!(board.len(), 2);
}

#[test]
fn test_multiple_campaigns() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let deadline = env.ledger().timestamp() + 86400;

    let id1 = client.create_campaign(&admin, &String::from_str(&env, "C1"), &1_000_000_000i128, &deadline);
    let id2 = client.create_campaign(&admin, &String::from_str(&env, "C2"), &2_000_000_000i128, &deadline);

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);

    let campaigns = client.get_campaigns();
    assert_eq!(campaigns.len(), 2);
    assert_eq!(campaigns.get(0).unwrap(), 1);
}

#[test]
fn test_close_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let id = client.create_campaign(
        &admin,
        &String::from_str(&env, "Help Kids"),
        &1_000_000_000i128,
        &(env.ledger().timestamp() + 86400),
    );

    client.close_campaign(&admin, &id);
    let campaign = client.get_campaign(&id);
    assert!(!campaign.active);
}

#[test]
#[should_panic(expected = "campaign not found")]
fn test_get_nonexistent_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);
    client.get_campaign(&999);
}

#[test]
#[should_panic(expected = "campaign closed")]
fn test_donate_closed_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let donor = Address::generate(&env);
    let id = client.create_campaign(
        &admin,
        &String::from_str(&env, "Test"),
        &1_000_000_000i128,
        &(env.ledger().timestamp() + 86400),
    );
    client.close_campaign(&admin, &id);
    client.donate(&donor, &id, &100i128);
}

#[test]
#[should_panic(expected = "campaign ended")]
fn test_donate_expired_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    // Set ledger timestamp to a known value
    env.ledger().set_timestamp(500);
    let contract_id = env.register(Opengive, ());
    let client = OpengiveClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let donor = Address::generate(&env);
    // Campaign with deadline at 100
    let id = client.create_campaign(&admin, &String::from_str(&env, "Expired"), &1_000_000_000i128, &100);
    // Advance ledger past deadline
    env.ledger().set_timestamp(200);
    client.donate(&donor, &id, &100i128);
}
