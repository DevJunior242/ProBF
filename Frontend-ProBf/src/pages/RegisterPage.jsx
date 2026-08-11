import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import PasswordField from "../components/PasswordField";
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
    role: "client",
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
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Créer un compte
        </Typography>

        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit}
          sx={{ mt: 2 }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          {codeParrainage && (
            <Alert severity="success">
              Code de parrainage <strong>{codeParrainage}</strong> détecté — 14
              jours Prime offerts après ton inscription !
            </Alert>
          )}

          <ToggleButtonGroup
            exclusive
            fullWidth
            value={form.role}
            onChange={(_, value) => value && setForm({ ...form, role: value })}
          >
            <ToggleButton value="client">Client</ToggleButton>
            <ToggleButton value="pro">Pro</ToggleButton>
            <ToggleButton value="fournisseur">Fournisseur</ToggleButton>
          </ToggleButtonGroup>

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
                J'accepte les <Link to="/cgu">CGU</Link> et la{" "}
                <Link to="/confidentialite">politique de confidentialité</Link>
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            S'inscrire
          </Button>

          <Typography variant="body2" sx={{ textAlign: "center" }}>
            Déjà un compte ? <Link to="/connexion">Connecte-toi</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
