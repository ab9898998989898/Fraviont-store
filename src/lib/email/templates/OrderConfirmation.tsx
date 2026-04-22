import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
  Button,
  Preview,
} from "@react-email/components";

interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  estimatedDelivery?: string;
}

function formatPrice(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

export function OrderConfirmation({
  orderNumber,
  customerName,
  items,
  subtotal,
  total,
  estimatedDelivery = "3–5 business days",
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Fraviont order {orderNumber} is confirmed</Preview>
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
          <Heading style={{ fontSize: 20, fontWeight: 300, color: "#F5F0E8" }}>
            Order Confirmed
          </Heading>
          <Text style={{ color: "#C8C0B0", fontSize: 14 }}>
            Hello {customerName}, thank you for your order.
          </Text>
          <Text style={{ color: "#7A7470", fontSize: 12 }}>Order #{orderNumber}</Text>

          <Section style={{ backgroundColor: "#141414", padding: "20px", marginTop: 20 }}>
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 12 }}>
                <Column>
                  <Text style={{ color: "#F5F0E8", fontSize: 14, margin: 0 }}>{item.name}</Text>
                  <Text style={{ color: "#7A7470", fontSize: 12, margin: 0 }}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={{ textAlign: "right" }}>
                  <Text style={{ color: "#C9A84C", fontSize: 14, margin: 0 }}>
                    {formatPrice(item.totalPrice)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr style={{ borderColor: "#2A2A2A" }} />
            <Row>
              <Column>
                <Text style={{ color: "#7A7470", fontSize: 12 }}>Total</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ color: "#C9A84C", fontSize: 16, fontWeight: 300 }}>
                  {formatPrice(total)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Text style={{ color: "#C8C0B0", fontSize: 14, marginTop: 20 }}>
            Estimated delivery: {estimatedDelivery}
          </Text>

          <Button
            href="https://fraviont.com/shop"
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
            Continue Shopping
          </Button>

          <Hr style={{ borderColor: "#2A2A2A", marginTop: 40 }} />
          <Text style={{ color: "#7A7470", fontSize: 11, textAlign: "center" }}>
            © {new Date().getFullYear()} Fraviont. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OrderConfirmation;
