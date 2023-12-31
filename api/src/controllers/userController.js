const { User, Role } = require("../db");
const { Op } = require("sequelize");

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No hay usuarios' });
    }
    return res.status(200).json({ users });
  } catch ({ message }) {
    return res.status(500).json({ error: message });
  }
};
const getUserById = async (req, res) => {
  const {id} = req.params;
  try {
    const users = await User.findByPk(id)
    if (!users) {
      return res.status(404).json({ message: `There is no user with id: ${id}` });
    }
    return res.status(200).json(users);
  } catch ({ message }) {
    return res.status(500).json({ error: message });
  }
};

const createUser = async (req, res) => {
  const { uid, email, name, role_name = 'client', active = true, province, city, postal_code, street, street_number, apartment_number, phone_number } = req.body;

  try {
    if (!uid || !email || !name || !role_name) return res.status(400).json({ message: "Incomplete information to create the user" });

    const role = await Role.findOne({
      where: {
        role_name
      }
    });

    if (!role) return res.status(400).json({ message: `There is no role with name ${role_name}` });

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { user_id: uid },
          { email: email }
        ]
      }
    });

    if (user) return res.status(400).json({ message: "User already exists." });

    const newUser = await User.create({ user_id:uid, email, name, role_name, active, province, city, postal_code, street, street_number, apartment_number,phone_number });

    await newUser.setRole(role.role_id)
    return res.status(201).json({ message: "User has been create." });

  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

const deleteUser = async (req, res) => {
  const { uid } = req.params;
  try {
    const user = await User.findByPk(uid);
    if (user) {
      if (user.active === false) {
        return res.status(400).json({ message: `The user ${user.name} has been previously removed.` });
      } else {
        user.active = false;
        await user.save();
        return res.status(200).json({ message: `The user ${user.name} has been deleted.` });
      }
    }
    return res.status(400).json({ message: `There is no user with uid: ${uid}.` });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

const putUser = async (req, res) => {
  const { user_id, email, name, role_name, active } = req.body;
  try {
    if (!user_id || !email || !name) return res.status(400).json({ message: "Incomplete information for the user." });

    const user = await User.findByPk(user_id);
    if (!user) return res.status(400).json({ message: `There is no user with uid: ${user_id}.` });

    if (email) user.email = email;
    if (name) user.name = name;
    if (role_name) {
      const roleId = await Role.findOne({ where: { role_name } });
      if (!roleId) return res.status(400).json({ message: `There is no role with name ${role_name}` });
      await user.setRole(roleId);
    }
    if (active !== undefined) user.active = active;

    await user.save();

    return res.status(200).json({ message: "The user has been updated." });
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
};

const getShippingAddressById = async(req,res) => {
  const {id: user_id} = req.params;

  try {
    const user = await User.findByPk(user_id);
    if (!user) return res.status(400).json({ message: `There is no user with id: ${user_id}.` });

    const shippingAddress = {
      user_id,
      province: user.province, 
      city: user.city, 
      postal_code: user.postal_code, 
      street: user.street, 
      street_number: user.street_number, 
      apartment_number: user.apartment_number,
      phone_number: user.phone_number
    }
    
    return res.status(200).json(shippingAddress);

  } catch ({message}) {
    res.status(500).json({ error: message });
  }
}

const addShippingAddress = async(req,res) => {
  const {user_id, province, city, postal_code, street, street_number, apartment_number, phone_number} = req.body;

  try {
    if (!user_id) return res.status(400).json({ message: "User Id is require." });

    const user = await User.findByPk(user_id);
    if (!user) return res.status(400).json({ message: `There is no user with this uid.` });

    if (province) user.province = province;
    if (city) user.city = city;
    if (postal_code) user.postal_code = postal_code;
    if (street) user.street = street;
    if (street_number) user.street_number = street_number;
    if (apartment_number) user.apartment_number = apartment_number;
    if (phone_number) user.phone_number = phone_number;

    await user.save();

    return res.status(200).json({ message: "The shipping address has been updated." });

  } catch ({message}) {
    res.status(500).json({ error: message });
  }

}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  deleteUser,
  putUser,
  addShippingAddress,
  getShippingAddressById
};