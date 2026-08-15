import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Paper,
  Box,
  Link,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import PasswordField from "../components/PasswordField";
import Logo from "../components/Logo";

export default function LoginPage() {
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // La 2FA se joue en 2 étapes : identifiants d'abord, puis (si le compte
  // l'a activée) un code TOTP ou un code de récupération.
  const [challengeToken, setChallengeToken] = useState(null);
  const [code, setCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(identifiant, password);
      if (result.twoFactor) {
        setChallengeToken(result.challengeToken);
      } else {
        const destination = location.state?.from?.pathname ?? "/";
        navigate(destination, { replace: true });
      }
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyTwoFactor(challengeToken, useRecoveryCode ? { recovery_code: code } : { code });
      const destination = location.state?.from?.pathname ?? "/";
      navigate(destination, { replace: true });
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(messages ? Object.values(messages).flat().join(" ") : "Code invalide.");
    } finally {
      setLoading(false);
    }
  };

  const backToCredentials = () => {
    setChallengeToken(null);
    setCode("");
    setUseRecoveryCode(false);
    setError(null);
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        py: { xs: 5, sm: 8 },
        px: 2,
      }}
    >
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
              {challengeToken ? "Vérification" : "Connexion"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {challengeToken
                ? useRecoveryCode
                  ? "Entre l'un de tes codes de récupération."
                  : "Entre le code à 6 chiffres généré par ton application d'authentification."
                : "Accède à ton espace ProBF."}
            </Typography>
          </Stack>

          {challengeToken ? (
            <Stack component="form" spacing={2} onSubmit={handleTwoFactorSubmit}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label={useRecoveryCode ? "Code de récupération" : "Code"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                fullWidth
                autoFocus
              />

              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                Vérifier
              </Button>
              <Button
                variant="text"
                size="small"
                fullWidth
                onClick={() => {
                  setUseRecoveryCode((v) => !v);
                  setCode("");
                  setError(null);
                }}
              >
                {useRecoveryCode
                  ? "Utiliser le code de mon application à la place"
                  : "Utiliser un code de récupération"}
              </Button>
              <Button variant="text" size="small" fullWidth onClick={backToCredentials}>
                ← Retour
              </Button>
            </Stack>
          ) : (
            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Téléphone ou email"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                required
                fullWidth
                autoFocus
              />
              <PasswordField
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Typography variant="body2" sx={{ textAlign: "right" }}>
                <Link
                  component={RouterLink}
                  to="/mot-de-passe-oublie"
                  underline="hover"
                >
                  Mot de passe oublié ?
                </Link>
              </Typography>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                Se connecter
              </Button>
            </Stack>
          )}
        </Paper>

        {!challengeToken && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 3 }}
          >
            Pas encore de compte ?{" "}
            <Link
              component={RouterLink}
              to="/inscription"
              underline="hover"
              fontWeight={600}
            >
              Inscris-toi
            </Link>
          </Typography>
        )}
      </Container>
    </Box>
  );
}
