exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    //For reference, Github lists usernames to 39 characters
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    //Why 254 -> https://stackoverflow.com/a/1199245/31572690
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    // Why 72 (we will use bcrypt) -> https://security.stackexchange.com/q/39849
    password: {
      type: "varchar(72)",
      notNull: true,
    },
    //Why timestamp with time zone (tz) -> https://justatheory.com/2012/04/postgres-use-timestamptz/
    createdAt: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
    updatedAt: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });
};

exports.down = false;
