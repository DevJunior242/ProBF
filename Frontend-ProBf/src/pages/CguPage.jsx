import { Container, Typography, Alert, Stack, Box } from '@mui/material'

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

export default function CguPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Conditions Générales d'Utilisation
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Dernière mise à jour : à compléter au lancement
      </Typography>

      <Alert severity="warning" sx={{ mb: 4 }}>
        Version de travail. À faire relire par un juriste avant le lancement public, notamment sur
        les clauses de responsabilité et les paiements avant activation.
      </Alert>

      <Section title="1. Objet">
        <Typography>
          ProBF est une plateforme numérique qui met en relation des clients avec des artisans
          (« Pros ») et des fournisseurs de matériel, au Burkina Faso. Les présentes Conditions
          Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme
          ProBF, accessible via son site web et son application.
        </Typography>
      </Section>

      <Section title="2. Rôle de ProBF">
        <Typography>
          ProBF est un intermédiaire de mise en relation. ProBF n'est pas partie aux contrats,
          devis ou prestations conclus entre un Client et un Pro ou un Fournisseur, et n'intervient
          pas dans leur exécution.
        </Typography>
        <Typography>
          ProBF ne garantit pas la qualité, la sécurité, la légalité ou la conformité des
          prestations réalisées par les Pros, ni des produits proposés par les Fournisseurs.
        </Typography>
      </Section>

      <Section title="3. Inscription et compte">
        <Typography>
          L'inscription nécessite un numéro de téléphone valide, qui sert d'identifiant de
          connexion. L'utilisateur s'engage à fournir des informations exactes et à jour, et est
          responsable de la confidentialité de son mot de passe.
        </Typography>
        <Typography>
          Un même utilisateur peut cumuler plusieurs rôles (Client, Pro, Fournisseur) sur un même
          compte. Chaque compte est personnel et ne peut être partagé.
        </Typography>
      </Section>

      <Section title="4. Avis et évaluations">
        <Typography>
          Les avis laissés par les Clients sont publics et doivent refléter une expérience réelle.
          Les avis frauduleux, diffamatoires ou rédigés en échange d'une contrepartie sont interdits
          et peuvent entraîner la suppression du contenu et la suspension du compte.
        </Typography>
      </Section>

      <Section title="5. Abonnements et paiement">
        <Typography>
          Les offres Pro (500 F CFA/mois) et Fournisseur (5 000 F CFA/mois) donnent accès à des
          fonctionnalités de visibilité et de gestion supplémentaires. Le paiement s'effectue
          manuellement via Orange Money ; l'abonnement est activé après vérification de la preuve
          de paiement par l'équipe ProBF, dans un délai raisonnable.
        </Typography>
        <Typography>
          En cas d'erreur d'activation imputable à ProBF, un remboursement ou un avoir peut être
          accordé. Hors erreur de notre part, les sommes versées pour une période d'abonnement déjà
          entamée ne sont pas remboursables.
        </Typography>
      </Section>

      <Section title="6. Parrainage">
        <Typography>
          Le programme de parrainage octroie des avantages (mois offert, période Prime) selon les
          règles en vigueur au moment de l'utilisation du code d'invitation. ProBF se réserve le
          droit d'invalider une récompense en cas d'usage frauduleux du dispositif (comptes
          multiples, parrainage de soi-même).
        </Typography>
      </Section>

      <Section title="7. Obligations de l'utilisateur">
        <Typography>
          L'utilisateur s'engage à ne publier aucun contenu illicite, trompeur ou portant atteinte
          aux droits d'un tiers, et à utiliser la plateforme conformément à sa destination.
        </Typography>
      </Section>

      <Section title="8. Suspension et résiliation">
        <Typography>
          ProBF peut suspendre ou supprimer un compte en cas de non-respect des présentes CGU, de
          comportement frauduleux ou abusif, après notification lorsque cela est possible.
          L'utilisateur peut demander la suppression de son compte à tout moment.
        </Typography>
      </Section>

      <Section title="9. Modification des CGU">
        <Typography>
          ProBF peut modifier les présentes CGU. Les utilisateurs seront informés des changements
          significatifs ; la poursuite de l'utilisation de la plateforme après notification vaut
          acceptation.
        </Typography>
      </Section>

      <Section title="10. Droit applicable">
        <Typography>
          Les présentes CGU sont soumises au droit burkinabè. Tout litige relève, à défaut de
          résolution amiable, des juridictions compétentes du Burkina Faso.
        </Typography>
      </Section>

      <Section title="11. Contact">
        <Typography>Pour toute question : contact@probf.bf (à mettre à jour).</Typography>
      </Section>
    </Container>
  )
}
