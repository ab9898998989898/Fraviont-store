import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
  Preview,
} from "@react-email/components";

interface WelcomeEmailProps {
  customerName?: string;
}

export function WelcomeEmail({ customerName = "there" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Fraviont — The Art of Presence</Preview>
      <Body style={{ backgroundColor: "#0A0A0A", fontFamily: "'Jost', 'Helvetica Neue', sans-serif", color: "#F5F0E8" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "60px 20px" }}>
          <Heading
            style={{
              color: "#C9A84C",
              fontSize: 28,
              fontWeight: 300,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            FRAVIONT
          </Heading>
          <Text
            style={{
              color: "#7A7470",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            The Art of Presence
          </Text>

          <Hr style={{ borderColor: "#2A2A2A", margin: "0 0 40px 0" }} />

          <Heading style={{ fontSize: 22, fontWeight: 300, color: "#F5F0E8", textAlign: "center", marginBottom: 20 }}>
            Welcome, {customerName}
          </Heading>

          <Text style={{ color: "#C8C0B0", fontSize: 15, lineHeight: "1.8", textAlign: "center", marginBottom: 10 }}>
            We are honoured to welcome you into the Fraviont world — a curated universe of luxury perfumes, cosmetics, and fine jewelry, each crafted to celebrate the art of being extraordinary.
          </Text>

          <Text style={{ color: "#C8C0B0", fontSize: 15, lineHeight: "1.8", textAlign: "center", marginBottom: 30 }}>
            Your account is now ready. Explore our collections, discover your signature scent, and find pieces that speak to who you are.
          </Text>

          <Section style={{ textAlign: "center", marginBottom: 40 }}>
            <Button
              href="https://fraviont.com/shop"
              style={{
                backgroundColor: "#C9A84C",
                color: "#0A0A0A",
                padding: "14px 40px",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textDecoration: "none",
                display: "inline-block",
                fontWeight: 500,
              }}
            >
              Explore Collections
            </Button>
          </Section>

          <Section style={{ backgroundColor: "#141414", padding: "24px 20px", textAlign: "center", marginBottom: 40 }}>
            <Text style={{ color: "#C9A84C", fontSize: 13, letterSpacing: "0.1em", margin: "0 0 8px 0" }}>
              As a member, you enjoy
            </Text>
            <Text style={{ color: "#C8C0B0", fontSize: 13, lineHeight: "2", margin: 0 }}>
              Early access to new collections — Personalised scent recommendations — Order tracking and history — Exclusive offers and invitations
            </Text>
          </Section>

          <Hr style={{ borderColor: "#2A2A2A", margin: "0 0 20px 0" }} />
          <Text style={{ color: "#7A7470", fontSize: 11, textAlign: "center", lineHeight: "1.6" }}>
            Questions? Reach us at hello@fraviont.com
          </Text>
          <Text style={{ color: "#3D3D3D", fontSize: 10, textAlign: "center", marginTop: 20 }}>
            © 2026 Fraviont. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;
