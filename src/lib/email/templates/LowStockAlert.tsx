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
  Row,
  Column,
} from "@react-email/components";

interface LowStockItem {
  name: string;
  sku: string;
  stock: number;
  threshold: number;
}

interface LowStockAlertProps {
  variants: LowStockItem[];
}

export function LowStockAlert({ variants }: LowStockAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${variants.length} product(s) are running low on stock`}</Preview>
      <Body style={{ backgroundColor: "#0A0A0A", fontFamily: "Jost, sans-serif", color: "#F5F0E8" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
          <Heading
            style={{
              color: "#C9A84C",
              fontSize: 24,
              fontWeight: 300,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            FRAVIONT
          </Heading>
          <Hr style={{ borderColor: "#2A2A2A" }} />
          <Heading style={{ fontSize: 20, fontWeight: 300 }}>Low Stock Alert</Heading>
          <Text style={{ color: "#C8C0B0", fontSize: 14 }}>
            {variants.length} variant(s) need restocking.
          </Text>
          <Section style={{ backgroundColor: "#141414", padding: "20px", marginTop: 20 }}>
            {variants.map((v, i) => (
              <Row key={i} style={{ marginBottom: 12 }}>
                <Column>
                  <Text style={{ color: "#F5F0E8", fontSize: 14, margin: 0 }}>{v.name}</Text>
                  <Text style={{ color: "#7A7470", fontSize: 12, margin: 0 }}>{v.sku}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text
                    style={{
                      color: v.stock === 0 ? "#8B2635" : "#9D6B1B",
                      fontSize: 14,
                      margin: 0,
                    }}
                  >
                    {v.stock} / {v.threshold} min
                  </Text>
                </Column>
              </Row>
            ))}
          </Section>
          <Button
            href="https://fraviont.com/admin/inventory"
            style={{
              backgroundColor: "#C9A84C",
              color: "#0A0A0A",
              padding: "12px 32px",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "inline-block",
              marginTop: 20,
            }}
          >
            Manage Inventory
          </Button>
          <Hr style={{ borderColor: "#2A2A2A", marginTop: 40 }} />
          <Text style={{ color: "#7A7470", fontSize: 11, textAlign: "center" }}>
            © {new Date().getFullYear()} Fraviont.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default LowStockAlert;
