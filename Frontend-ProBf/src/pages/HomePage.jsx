import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Container,
  Stack,
  Typography,
  MenuItem,
  TextField,
  Grid,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Button,
  Avatar,
  InputAdornment,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import HandymanIcon from "@mui/icons-material/Handyman";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import PlumbingIcon from "@mui/icons-material/Plumbing";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import BuildIcon from "@mui/icons-material/Build";
import CampaignIcon from "@mui/icons-material/Campaign";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GroupsIcon from "@mui/icons-material/Groups";
import api from "../api/client";
import HeroCarousel from "../components/HeroCarousel";
import { useAuth } from "../context/AuthContext";

const ICONES_METIER = {
  electricien: ElectricalServicesIcon,
  plombier: PlumbingIcon,
  "froid-climatisation": AcUnitIcon,
};
const MOTS_ROTATIFS = [
  "Électricien",
  "Plombier",
  "Froid & Climatisation",
  "Maçon",
  "Menuisier",
  "Peintre en bâtiment",
  "Soudeur / Métallier",
  "Mécanicien auto",
  "Carreleur",
  "Plaquiste",
  "Serrurier",
  "Jardinier / Paysagiste",
  "Couturier / Tailleur",
  "Coiffeur / Esthéticienne",
  "Nettoyage / Ménage",
  "Déménagement",
  "Vitrier",
  "Photographe",
  "Informatique / Réparation",
];
// const MOTS_ROTATIFS = [
//   "Électricien",
//   "Plombier",
//   "Technicien froid",
//   "artisan",
// ];
const ROTATION_MS = 2600;

const ETAPES = [
  {
    icon: SearchIcon,
    titre: "Cherche",
    texte:
      "Filtre par métier et par quartier pour trouver le bon pro près de chez toi.",
  },
  {
    icon: WhatsAppIcon,
    titre: "Contacte",
    texte: "Un clic pour ouvrir WhatsApp et discuter directement avec le pro.",
  },
  {
    icon: HandymanIcon,
    titre: "Fais-toi aider",
    texte:
      "Le pro intervient, tu laisses un avis pour aider les prochains clients.",
  },
];

function TexteRadiant({ children, component = "span" }) {
  return (
    <Box
      component={motion.span}
      animate={{ backgroundPosition: ["0% center", "200% center"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      sx={{
        display: component === "span" ? "inline-block" : "block",
        backgroundImage:
          "linear-gradient(90deg, #FDBA74, #F59E0B, #F3680F, #F59E0B, #FDBA74)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
    >
      {children}
    </Box>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

function Reveal({ children, ...props }) {
  return (
    <Box
      component={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      {...props}
    >
      {children}
    </Box>
  );
}

export default function HomePage() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [metiers, setMetiers] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [metier, setMetier] = useState("");
  const [quartierId, setQuartierId] = useState("");
  const [recherche, setRecherche] = useState("");
  const [totalPros, setTotalPros] = useState(null);
  const [motIndex, setMotIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/metiers"),
      api.get("/quartiers"),
      api.get("/pros"),
    ]).then(([m, q, p]) => {
      setMetiers(m.data);
      setQuartiers(q.data);
      setTotalPros(p.data.total);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMotIndex((i) => (i + 1) % MOTS_ROTATIFS.length);
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, []);

  const montrerCtaArtisan = !hasRole("pro") && !hasRole("fournisseur");

  const lancerRecherche = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (recherche) params.set("recherche", recherche);
    if (metier) params.set("metier", metier);
    if (quartierId) params.set("quartier", quartierId);
    navigate(`/pros${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: 480, sm: 520 },
        }}
      >
        <HeroCarousel />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{ position: "relative", py: { xs: 5, sm: 7 } }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                fontSize: { xs: "1.9rem", sm: "3rem" },
                color: "#fff",
                lineHeight: 1.15,
                mb: 1,
              }}
            >
              Besoin d'un{" "}
              <Box
                component="span"
                sx={{ display: "inline-block", minWidth: { xs: 0, sm: 320 } }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={motIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: "inline-block" }}
                  >
                    <TexteRadiant>{MOTS_ROTATIFS[motIndex]}</TexteRadiant>
                  </motion.span>
                </AnimatePresence>
              </Box>
              <br />
              de confiance ?
            </Typography>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            <Typography
              sx={{
                mb: 3,
                color: "rgba(255,255,255,0.9)",
                fontSize: { xs: "1rem", sm: "1.15rem" },
                maxWidth: 560,
              }}
            >
              ProBF connecte clients, artisans et fournisseurs de matériel
              partout au Burkina Faso. Cherche un pro vérifié ou publie ta
              demande gratuitement — réponse en moins d'une heure.
            </Typography>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            <Paper
              elevation={4}
              sx={{ p: 2, display: "inline-block", maxWidth: "100%" }}
            >
              <Stack
                component="form"
                onSubmit={lancerRecherche}
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
              >
                <TextField
                  label="Nom du pro"
                  placeholder="Ex: Pro Demo"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  sx={{ minWidth: 200 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  select
                  label="Métier"
                  value={metier}
                  onChange={(e) => setMetier(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">Tous les métiers</MenuItem>
                  {metiers.map((m) => (
                    <MenuItem key={m.id} value={m.slug}>
                      {m.nom}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Quartier"
                  value={quartierId}
                  onChange={(e) => setQuartierId(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">Tous les quartiers</MenuItem>
                  {quartiers.map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.nom} — {q.ville?.nom}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Rechercher
                </Button>
              </Stack>
            </Paper>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.85)" }}>
              Pas trouvé ce qu'il te faut ?{" "}
              <Box
                component={RouterLink}
                to="/demandes/nouvelle"
                sx={{ color: "#FDBA74", fontWeight: 600 }}
              >
                Publie ta demande gratuitement →
              </Box>
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Catégories vedettes */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Reveal>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Catégories
          </Typography>
        </Reveal>
        <Grid container spacing={2} sx={{ mb: 5 }}>
          {metiers.map((m, i) => {
            const Icone = ICONES_METIER[m.slug] ?? BuildIcon;
            return (
              <Grid key={m.id} size={{ xs: 6, sm: 4 }}>
                <Reveal custom={i}>
                  <Card variant="outlined">
                    <CardActionArea
                      onClick={() => navigate(`/pros?metier=${m.slug}`)}
                      sx={{ p: 2 }}
                    >
                      <Stack
                        spacing={1}
                        sx={{ alignItems: "center", textAlign: "center" }}
                      >
                        <Icone color="primary" sx={{ fontSize: 32 }} />
                        <Typography fontWeight={600}>{m.nom}</Typography>
                      </Stack>
                    </CardActionArea>
                  </Card>
                </Reveal>
              </Grid>
            );
          })}
        </Grid>

        {/* CTA Pros */}
        <Reveal>
          <Card
            variant="outlined"
            sx={{
              background:
                "linear-gradient(135deg, rgba(217,98,43,0.08), rgba(245,158,11,0.08))",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Avatar
                    sx={{ bgcolor: "primary.main", width: 56, height: 56 }}
                  >
                    <GroupsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {totalPros !== null
                        ? `${totalPros} pros disponibles`
                        : "Des pros disponibles"}{" "}
                      près de chez toi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Électriciens, plombiers, techniciens froid — vérifiés et
                      notés par la communauté.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/pros"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Voir les pros
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Reveal>
      </Container>

      {/* Comment ça marche */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Reveal>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ textAlign: "center", mb: 4 }}
            >
              Comment ça marche
            </Typography>
          </Reveal>
          <Grid container spacing={4}>
            {ETAPES.map(({ icon: Icone, titre, texte }, index) => (
              <Grid key={titre} size={{ xs: 12, sm: 4 }}>
                <Reveal custom={index}>
                  <Stack
                    spacing={1.5}
                    sx={{ alignItems: "center", textAlign: "center" }}
                  >
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 56, height: 56 }}
                    >
                      <Icone />
                    </Avatar>
                    <Typography fontWeight={700}>
                      {index + 1}. {titre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {texte}
                    </Typography>
                  </Stack>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA artisan / fournisseur */}
      {montrerCtaArtisan && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Reveal>
            <Card
              variant="outlined"
              sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: { sm: "center" },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Tu es artisan ou fournisseur ?
                    </Typography>
                    <Typography sx={{ opacity: 0.9 }}>
                      Inscris-toi gratuitement, gagne en visibilité et reçois
                      des demandes de clients près de chez toi.
                    </Typography>
                  </Box>
                  <Button
                    component={RouterLink}
                    to="/inscription"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "background.paper",
                      color: "primary.main",
                      "&:hover": { bgcolor: "background.paper" },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Créer mon compte Pro
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Reveal>
        </Container>
      )}

      {/* CTA Radar de demande */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Reveal>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <CampaignIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography fontWeight={700}>
                      Tu ne trouves pas ce qu'il te faut ?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Publie ta demande, les pros du quartier concerné pourront
                      te contacter.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/demandes/nouvelle"
                  variant="outlined"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Publier une demande
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Reveal>
      </Container>

      {/* CTA Fournisseurs */}
      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Reveal>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  alignItems: { sm: "center" },
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <StorefrontIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography fontWeight={700}>
                      Besoin de matériel pour ta prestation ?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Découvre nos fournisseurs partenaires et leurs produits.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  component={RouterLink}
                  to="/fournisseurs"
                  variant="outlined"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Voir les fournisseurs
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Reveal>
      </Container>
    </Box>
  );
}
