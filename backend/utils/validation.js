
// ==================== VALIDATION HELPERS ====================
// utils/validation.js

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateUserInput = (email, password) => {
    const errors = [];

    if (!email) {
        errors.push('Email required hai!');
    } else if (!validateEmail(email)) {
        errors.push('Email format galat hai!');
    }

    if (!password) {
        errors.push('Password required hai!');
    } else if (!validatePassword(password)) {
        errors.push('Password kam se kam 6 characters ka hona chahiye!');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateUserInput
};