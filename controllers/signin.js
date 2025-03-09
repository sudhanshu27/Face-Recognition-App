const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  db.select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      if (data.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(500).json({ error: "Unable to retrieve user data" }));
      } else {
        res.status(400).json({ error: "Incorrect password" });
      }
    })
    .catch(() => res.status(500).json({ error: "Server error. Please try again later." }));
};

module.exports = {
  handleSignin: handleSignin,
};
