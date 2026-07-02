import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
const addStudent = async () => {
  await addDoc(collection(db, "students"), {
    name: "Rahul",
    email: "rahul@gmail.com",
    course: "BCA"
  });

  alert("Student Added");
};
<button onClick={addStudent}>
  Add Student
</button>