const express = require("express");
const router = express.Router();
const AppDataSource = require("../data-source");
const Invitation = require("../entity/Invitation");

// Función para generar un slug único simple
function generateSlug() {
  return Math.random().toString(36).substring(2, 8);
}

// POST /api/invitations
router.post("/", async (req, res) => {
  try {
    const { child_name, organizer_phone, title, message, start_at, end_at, location } = req.body;

    // Validación mínima
    if (!child_name || !organizer_phone || !start_at || !end_at || !location) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const invitationRepo = AppDataSource.getRepository("Invitation");

    const slug = generateSlug();

    const invitation = invitationRepo.create({
      child_name,
      organizer_phone,
      title,
      message,
      start_at,
      end_at,
      location,
      slug,
    });

    await invitationRepo.save(invitation);

    res.json({ message: "Invitación creada", slug });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la invitación." });
  }
});


// GET /api/invitations/:slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const invitationRepo = AppDataSource.getRepository("Invitation");

    const invitation = await invitationRepo.findOne({
      where: { slug: slug },
    });

    if (!invitation) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    res.json({
      child_name: invitation.child_name,
      organizer_phone: invitation.organizer_phone,
      title: invitation.title,
      message: invitation.message,
      start_at: invitation.start_at,
      end_at: invitation.end_at,
      location: invitation.location,
      slug: invitation.slug,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar la invitación." });
  }
});

// POST /api/invitations/:slug/respond
router.post("/:slug/respond", async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined", "maybe"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const invitationRepo = AppDataSource.getRepository("Invitation");
    const responseRepo = AppDataSource.getRepository("Response");

    const invitation = await invitationRepo.findOne({ where: { slug } });

    if (!invitation) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    // Guardar la respuesta
    const response = responseRepo.create({
      status,
      invitation: invitation,
    });

    await responseRepo.save(response);

    // Generar link de WhatsApp
    const messageText = encodeURIComponent(
      `Hola, confirmo que ${status === "accepted" ? "asistiré" : status === "declined" ? "no podré asistir" : "tal vez asistiré"} al cumple de ${invitation.child_name}`
    );

    const phone = invitation.organizer_phone.replace(/\D/g, ""); // quita caracteres no numéricos
    const whatsappUrl = `https://wa.me/${phone}?text=${messageText}`;

    res.json({ message: "Respuesta registrada", whatsapp_url: whatsappUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar la respuesta" });
  }
});

router.get("/:slug/responses", async (req, res) => {
  try {
    const { slug } = req.params;
    const invitationRepo = AppDataSource.getRepository("Invitation");
    const responseRepo = AppDataSource.getRepository("Response");

    const invitation = await invitationRepo.findOne({ 
      where: { slug },
      relations: ["responses"]
    });

    if (!invitation) {
      return res.status(404).json({ error: "Invitación no encontrada" });
    }

    const total = invitation.responses.length;
    const accepted = invitation.responses.filter(r => r.status === "accepted").length;
    const declined = invitation.responses.filter(r => r.status === "declined").length;
    const maybe = invitation.responses.filter(r => r.status === "maybe").length;

    res.json({
      child_name: invitation.child_name,
      title: invitation.title,
      total,
      accepted,
      declined,
      maybe,
      responses: invitation.responses.map(r => ({
        id: r.id,
        status: r.status,
         responded_at: r.responded_at ? r.responded_at.toISOString().slice(0, 19) : ""
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener resumen" });
  }
});

module.exports = router;

