const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) =>/^\d{2,3}-\d+$/.test(v),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: true,
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});
Person = mongoose.model("person", personSchema);

const SavePerson = async (obj) => {
  const newContact = new Person(obj);
  try {
    const res = await newContact.save();
    return res;
  } catch (error) {
    console.log("error in saving person");
    throw error;
  }
};

const DeletePerson = async (id) => {
  try {
    const objectID = new ObjectId(id);
    const res = await Person.findByIdAndDelete({ _id: objectID });
    if (!res) {
      throw new Error("Person not found");
    }
    return res;
  } catch (err) {
    throw err;
  }
};

const UpdatePerson = async (id, obj) => {
  try {
    const res = await Person.findByIdAndUpdate(id, obj, {
      new: true,
      runValidators: true,
      context: "query",
    });
    return res;
  } catch (error) {
    throw error;
  }
};

const FindUsingId = async (id) => {
  try {
    const objectId = new ObjectId(id);
    const res = await Person.findById(id);
    return res;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  Person,
  SavePerson,
  DeletePerson,
  UpdatePerson,
  FindUsingId,
};
