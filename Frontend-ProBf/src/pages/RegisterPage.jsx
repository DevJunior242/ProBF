import { useState } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Link,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { useAuth } from "../context/AuthContext";
import PasswordField from "../components/PasswordField";
import Logo from "../components/Logo";
import TurnstileWidget from "../components/TurnstileWidget";
import api from "../api/client";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeParrainage = searchParams.get("parrain");
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    email: "",
    password: "",
    password_confirmation: "",
    roles: ["client"],
    turnstile_token: "",
  });
  const [cguAccepted, setCguAccepted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!cguAccepted) {
      setError(
        "Tu dois accepter les CGU et la politique de confidentialité pour t'inscrire.",
      );
      return;
    }

    setLoading(true);
    try {
      await register({ ...form, cgu_accepted: true });

      if (codeParrainage) {
        try {
          await api.post("/invitations/redeem", { code: codeParrainage });
        } catch {
          // code invalide ou déjà utilisé : on n'empêche pas l'inscription pour autant
        }
      }

      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message ??
        "Inscription impossible, vérifie tes informations.";
      setError(message);
      console.log("erreur server", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", display: "flex", justifyContent: "center", py: { xs: 5, sm: 8 }, px: 2 }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 480,
            height: 480,
            borderRadius: "50%",
            bgcolor: "primary.main",
            opacity: 0.12,
            filter: "blur(90px)",
          }}
        />
      </Box>

      <Container maxWidth="xs" disableGutters>
        <Stack sx={{ alignItems: "center", mb: 3 }}>
          <Logo size={40} />
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 4 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={700}>
              Créer un compte
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejoins ProBF en quelques secondes.
            </Typography>
          </Stack>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            {error && <Alert severity="error">{error}</Alert>}
            {codeParrainage && (
              <Alert severity="success">
                Code de parrainage <strong>{codeParrainage}</strong> détecté — 14
                jours Prime offerts après ton inscription !
              </Alert>
            )}

            <Stack spacing={0.5}>
              <ToggleButtonGroup
                fullWidth
                value={form.roles}
                onChange={(_, values) => values.length && setForm({ ...form, roles: values })}
              >
                <ToggleButton value="client">
                  <Stack spacing={0.5} sx={{ alignItems: "center", py: 0.5 }}>
                    <PersonOutlineIcon fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                      Client
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="pro">
                  <Stack spacing={0.5} sx={{ alignItems: "center", py: 0.5 }}>
                    <HandymanOutlinedIcon fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                      Pro
                    </Typography>
                  </Stack>
                </ToggleButton>
                <ToggleButton value="fournisseur">
                  <Stack spacing={0.5} sx={{ alignItems: "center", py: 0.5 }}>
                    <Inventory2OutlinedIcon fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                      Fournisseur
                    </Typography>
                  </Stack>
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary">
                Tu peux cocher plusieurs profils, par exemple Pro et Fournisseur.
              </Typography>
            </Stack>

            <TextField
              label="Nom complet"
              value={form.nom}
              onChange={update("nom")}
              required
              fullWidth
            />
            <TextField
              label="Téléphone"
              value={form.telephone}
              onChange={update("telephone")}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={update("email")}
              required
              fullWidth
            />
            <PasswordField
              label="Mot de passe"
              value={form.password}
              onChange={update("password")}
            />
            <PasswordField
              label="Confirmer le mot de passe"
              value={form.password_confirmation}
              onChange={update("password_confirmation")}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={cguAccepted}
                  onChange={(e) => setCguAccepted(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  J'accepte les <Link component={RouterLink} to="/cgu">CGU</Link> et la{" "}
                  <Link component={RouterLink} to="/confidentialite">politique de confidentialité</Link>
                </Typography>
              }
            />

            <TurnstileWidget
              onVerify={(token) => setForm({ ...form, turnstile_token: token })}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !cguAccepted}
            >
              S'inscrire
            </Button>
          </Stack>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
          Déjà un compte ?{" "}
          <Link component={RouterLink} to="/connexion" underline="hover" fontWeight={600}>
            Connecte-toi
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
