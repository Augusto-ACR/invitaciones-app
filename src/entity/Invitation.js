const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Invitation",
  tableName: "invitations",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    slug: {
      type: "varchar",
      length: 50,
      unique: true,
    },
    child_name: {
      type: "varchar",
      length: 200,
    },
    organizer_phone: {
      type: "varchar",
      length: 50,
    },
    title: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    message: {
      type: "text",
      nullable: true,
    },
    start_at: {
      type: "timestamp",
    },
    end_at: {
      type: "timestamp",
    },
    location: {
      type: "varchar",
      length: 500,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    responses: {
      target: "Response",
      type: "one-to-many",
      inverseSide: "invitation",
      cascade: true,
    },
  },
});