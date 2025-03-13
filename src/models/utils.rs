use argon2::{
    Argon2, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};

// パスワード文字列のHash化
pub fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon = Argon2::default();
    match argon.hash_password(password.as_bytes(), &salt) {
        Ok(hash) => hash.to_string(),
        Err(_) => panic!("Failed to hash password"),
    }
}

// パスワード文字列の検証
pub fn verify_password(hashed_password: &str, password: &str) -> bool {
    let parsed_hash = match argon2::PasswordHash::new(hashed_password) {
        Ok(hash) => hash,
        Err(_) => panic!("Failed to parse hash"),
    };
    let argon = Argon2::default();
    argon
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok()
}

#[cfg(test)]
// 暗号化された文字列と復元した文字列を出力し比較する
mod tests {

    use super::*;

    #[test]
    fn test_token() {
        let password = "password";
        let hashed_password = hash_password(password);
        println!("Hashed password, {} -> {}", password, hashed_password);
        assert!(verify_password(&hashed_password, password));
    }
}
