const Editorial = require("../db");

const createEditorial = async (req, res) => {
    const { name } = req.body;
 
   const newEditorial = await Editorial.findOne({where: { name }});
 
   !name && res.status(400).json({message: "Name is required"});
   newEditorial && res.status(406).json({ message: `Editorial with name ${name} already exists` });

    try {
     newEditorial = await Editorial.create({
       name
     });
 
     return res.status(201).json({message: "Editorial successfuly created"});
   } catch (error) {
     return res.status(500).json({ message: error.message });
   }
 };

 module.exports = createEditorial