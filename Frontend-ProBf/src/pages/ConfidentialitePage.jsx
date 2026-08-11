import { Container, Typography, Alert, Stack, Box, List, ListItem, ListItemText } from '@mui/material'

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Stack spacing={1.5}>{children}</Stack>
    </Box>
  )
}

export default function ConfidentialitePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Politique de confidentialité
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Dernière mise à jour : à compléter au lancement
      </Typography>

      <Alert severity="warning" sx={{ mb: 4 }}>
        Version de travail. À faire relire par un juriste avant le lancement public.
      </Alert>

      <Section title="1. Responsable du traitement">
        <Typography>
          ProBF est responsable du traitement des données personnelles collectées via la
          plateforme. Contact : contact@probf.bf (à mettre à jour).
        </Typography>
      </Section>

      <Section title="2. Données collectées">
        <List dense>
          <ListItem disableGutters>
            <ListItemText primary="Identité" secondary="nom, numéro de téléphone, email (optionnel)" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Localisation" secondary="ville et quartier renseignés (recherche, zone d'intervention)" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Activité" secondary="avis laissés, demandes publiées, clics vers WhatsApp, portfolio" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Paiement" secondary="preuve de transaction Orange Money, montant, référence" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Techniques" secondary="jeton de connexion, préférence d'affichage (thème clair/sombre)" />
          </ListItem>
        </List>
      </Section>

      <Section title="3. Finalités du traitement">
        <Typography>
          Ces données sont utilisées pour : créer et sécuriser le compte, mettre en relation
          Clients, Pros et Fournisseurs, afficher les statistiques de visibilité aux Pros et
          Fournisseurs, traiter les abonnements, prévenir la fraude et améliorer le service.
        </Typography>
      </Section>

      <Section title="4. Partage des données">
        <Typography>
          Le nom, la note moyenne, les avis publics et le portfolio d'un Pro sont visibles par les
          Clients. Le numéro de téléphone d'un Pro est communiqué au Client au moment du clic sur
          « Contacter » (redirection WhatsApp), afin de permettre la mise en relation.
        </Typography>
        <Typography>
          ProBF ne vend ni ne loue les données personnelles à des tiers à des fins publicitaires.
        </Typography>
      </Section>

      <Section title="5. Durée de conservation">
        <Typography>
          Les données sont conservées le temps où le compte est actif, puis archivées ou supprimées
          dans un délai raisonnable après une demande de suppression ou une inactivité prolongée,
          sous réserve des obligations légales de conservation (notamment comptables).
        </Typography>
      </Section>

      <Section title="6. Sécurité">
        <Typography>
          Les mots de passe sont stockés sous forme chiffrée (hachage). Les échanges avec la
          plateforme sont sécurisés. L'accès aux données est limité aux besoins du service.
        </Typography>
      </Section>

      <Section title="7. Droits des utilisateurs">
        <Typography>
          Chaque utilisateur peut demander l'accès, la rectification ou la suppression de ses
          données personnelles en contactant ProBF. La suppression du compte entraîne la
          suppression ou l'anonymisation des données associées, hors obligations légales de
          conservation.
        </Typography>
      </Section>

      <Section title="8. Cookies et stockage local">
        <Typography>
          La plateforme utilise le stockage local du navigateur pour conserver la session de
          connexion et la préférence d'affichage (thème). Aucun cookie publicitaire tiers n'est
          utilisé.
        </Typography>
      </Section>

      <Section title="9. Contact">
        <Typography>
          Pour exercer vos droits ou toute question relative à vos données : contact@probf.bf (à
          mettre à jour).
        </Typography>
      </Section>
    </Container>
  )
}
