import Donation from "../models/donationModel.js";

export const createDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      donor: req.user.id
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "available" })
      .populate("donor", "name location");

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markCollected = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    donation.status = "completed";
    await donation.save();

    res.json({ message: "Donation marked as completed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};