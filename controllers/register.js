const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
   
  if (!email || !name || !password) {
    return res.status(400).json("incorrect form submission");
  }
   
  const hash = bcrypt.hashSync(password);

  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch((err) => {
        if (err.code === "23505") { // Unique constraint violation (email already exists)
          res.status(400).json({ error: "User already exists" });
        } else {
          res.status(500).json({ error: "Database transaction failed" });
        }
      });
  }).catch((err) => res.status(500).json({ error: "Server error. Please try again later." }));
};

module.exports = {
  handleRegister: handleRegister,
};
