const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Response",
  tableName: "responses",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    status: {
      type: "enum",
      enum: ["accepted", "declined", "maybe"],
    },
    responded_at: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    invitation: {
      target: "Invitation",
      type: "many-to-one",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});