import memberModel from "../models/member.js";

export const addMember = async (req, res) => {
  try {
    const { name, relation, age, avatar, email, phone } = req.body;

    if (!name || !relation || typeof age === "undefined") {
      return res.status(400).json({
        message: "Name, relation, and age are required fields."
      });
    }

    const newMember = new memberModel({
      name,
      relation,
      age,
      avatar: avatar ? avatar.trim() : '',
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : ''
    });

    const savedMember = await newMember.save();

    return res.status(201).json({
      message: "Family member added successfully.",
      data: savedMember
    });
  } catch (error) {
    let errors = {};
    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });
      return res.status(400).json({
        message: "Validation failed.",
        errors,
      });
    }
    return res.status(500).json({
      message: "Server error. Could not add member.",
      errors: error.message
    });
  }
};

// Get all members
export const getAllMembers = async (req, res) => {
  try {
    const members = await memberModel.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Family members retrieved successfully.",
      data: members
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error. Could not retrieve members.",
      errors: { general: error.message }
    });
  }
};

export const getSingleMember = async (req, res) => {
  try {
    const member = await memberModel.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    return res.status(200).json({
      message: "member retrieved successfully.",
      data: member
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving member' });
  }
};
