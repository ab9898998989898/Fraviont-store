import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";

interface ShippingNotificationProps {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier?: string;
}

export function ShippingNotification({
  orderNumber,
  customerName,
  trackingNumber,
  carrier = "Standard Courier",
}: ShippingNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Fraviont order {orderNumber} has shipped</Preview>
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
          <Heading style={{ fontSize: 20, fontWeight: 300 }}>Your Order Has Shipped</Heading>
          <Text style={{ color: "#C8C0B0", fontSize: 14 }}>
            Hello {customerName}, your order is on its way.
          </Text>
          <Section style={{ backgroundColor: "#141414", padding: "20px", marginTop: 20 }}>
            <Text style={{ color: "#7A7470", fontSize: 12, margin: 0 }}>Order</Text>
            <Text style={{ color: "#F5F0E8", fontSize: 14, margin: "4px 0 16px" }}>
              #{orderNumber}
            </Text>
            <Text style={{ color: "#7A7470", fontSize: 12, margin: 0 }}>Tracking Number</Text>
            <Text style={{ color: "#C9A84C", fontSize: 14, margin: "4px 0 16px" }}>
              {trackingNumber}
            </Text>
            <Text style={{ color: "#7A7470", fontSize: 12, margin: 0 }}>Carrier</Text>
            <Text style={{ color: "#F5F0E8", fontSize: 14, margin: "4px 0" }}>{carrier}</Text>
          </Section>
          <Hr style={{ borderColor: "#2A2A2A", marginTop: 40 }} />
          <Text style={{ color: "#7A7470", fontSize: 11, textAlign: "center" }}>
            © {new Date().getFullYear()} Fraviont.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ShippingNotification;
