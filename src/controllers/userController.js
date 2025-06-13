const { useRef } = require("react");
const db = require("../config/firebase");

exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const newUser = { name, email };
    const docRef = await db.collection("users").add(newUser);
    res.status(201).json({ id: docRef.id, ...newUser });
  } catch (error) {
    console.error("error creating user:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getUsersById = async (req, res) => {
  try {
    const userId = req.params.id;
    const doc = await db.collection("users").doc(userId).get();
    if (!doc.exists) {
      return res.status(404).json({ id: doc.id, ...doc.data() });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({
        error: "you must provide at least ine field to update (name or email)",
      });
    }
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "user not found" });
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    await userRef.update(updateData);
    const updateDoc = await userRef.get();
    res.status(200).json({ id: doc.id, ...doc.data(), ...updateData });
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "user not found" });
    }
    await userRef.delete();
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
