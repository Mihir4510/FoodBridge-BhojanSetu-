import Request from "../models/requestModel.js";
import Donation from "../models/donationModel.js";

export const createRequest = async (req, res) => {
  try {
    const request = await Request.create({
      donation: req.body.donationId,
      ngo: req.user.id
    });

    await Donation.findByIdAndUpdate(req.body.donationId, {
      status: "requested"
    });

    res.status(201).json(request);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    request.status = "approved";
    await request.save();

    res.json({ message: "Request approved" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};