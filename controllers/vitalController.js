import memberModel from "../models/member.js";

export const addVitals = async (req, res) => {
  try {
    const { id } = req.params;
    const { bloodPressure, sugar, heartRate, weight } = req.body;

    const member = await memberModel.findById(id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const vitals = member.vitals;

    const hasPreviousVitals =
      vitals?.bloodPressure ||
      vitals?.sugar ||
      vitals?.heartRate ||
      vitals?.weight;

    if (hasPreviousVitals) {
      member.vitalsHistory.push({
        ...vitals.toObject(),
        recordedAt: vitals.recordedAt || new Date(),
      });
    }

    if (bloodPressure !== undefined) vitals.bloodPressure = bloodPressure;
    if (sugar !== undefined) vitals.sugar = sugar;
    if (heartRate !== undefined) vitals.heartRate = heartRate;
    if (weight !== undefined) vitals.weight = weight;

    vitals.recordedAt = new Date();

    await member.save();

    return res.status(200).json({
      message: 'Vitals updated successfully',
      data: member.vitals,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};


export const getLatestVitals = async (req, res) => {
  try {
    const member = await memberModel.findById(req.params.id).select('vitals');
    if (!member) return res.status(404).json({ message: 'Member not found' });

    res.json({ data: member.vitals });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vitals', error: error.message });
  }
};

export const getVitalsHistory = async (req, res) => {
  try {
    const member = await memberModel.findById(req.params.id).select('vitalsHistory');
    if (!member) return res.status(404).json({ message: 'Member not found' });

    res.json({ data: member.vitalsHistory.reverse() }); // latest first
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vitals history', error: error.message });
  }
};
