function calculatePriority(createdAt) {

    const now = new Date();
    const donationTime = new Date(createdAt);

    const diffHours = (now - donationTime) / (1000 * 60 * 60);

    if (diffHours > 6) {
        return "expired";
    }

    if (diffHours > 4) {
        return "high";
    }

    if (diffHours > 2) {
        return "medium";
    }

    return "low";
}

module.exports = calculatePriority;