import { Invoice } from "@/types";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { BaseDirectory, writeFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import { Button } from "../ui/button";
import { open } from "@tauri-apps/plugin-shell";
import { useGetClinetById } from "@/api/queries";

const styles = StyleSheet.create({
  page: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  container: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    borderBottom: "1px solid #ccc",
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoItem: {
    width: "48%",
  },
  text: {
    fontSize: 12,
    marginBottom: 4,
  },
  table: {
    width: "100%",
    marginVertical: 16,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: "bold",
    padding: 4,
    textAlign: "left",
    backgroundColor: "#f1f1f1",
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  tableCell: {
    fontSize: 12,
    padding: 4,
    textAlign: "left",
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  lastCell: {
    borderRightWidth: 0,
  },
  totalSection: {
    marginTop: 16,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

// Button to trigger print

const InvoicePrint = ({ invoice }: { invoice: Invoice }) => {
  const { clientId, goods, totalPaid } = invoice;
  console.log(invoice);

  const { data: client } = useGetClinetById(clientId.$oid!);
  const {
    username,
    email,
    phone,
    company_name: companyName,
    city,
    address,
  } = client;

  const page = (
    <Page size="A4" style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.subtitle}>Invoice Details</Text>

        {/* Customer Information */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.text}>Name: {username}</Text>
              <Text style={styles.text}>Email: {email || "N/A"}</Text>
              <Text style={styles.text}>Phone: {phone}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.text}>Company Name: {companyName}</Text>
              <Text style={styles.text}>City: {city}</Text>
              <Text style={styles.text}>Address: {address}</Text>
            </View>
          </View>
        </View>

        {/* Goods Table */}
        <View>
          <Text style={styles.sectionTitle}>Goods</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, { flex: 3 }]}>Item Name</Text>
              <Text style={[styles.tableHeader, { flex: 1 }]}>Quantity</Text>
              <Text style={[styles.tableHeader, { flex: 1 }]}>Price</Text>
              <Text style={[styles.tableHeader, { flex: 1 }]}>Total</Text>
            </View>
            {goods.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{item.name}</Text>
                <Text style={styles.tableCell}>{item.stock}</Text>
                <Text style={styles.tableCell}>${item.price.toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.lastCell]}>
                  ${(item.stock * item.price).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Amount Due */}
        <View style={styles.totalSection}>
          <Text>Total Amount Due: ${total.toFixed(2)}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Thank you for your business!</Text>
      </View>
    </Page>
  );
  const handlePrintPDF = async () => {
    // FIXME: before build to production
    await open(
      `/home/matrix/Documents/invoices/invoice_${invoice.created_at.$date.$numberLong}.pdf`
    );
    try {
    } catch (error) {
      console.error("Error opening the invoice for printing:", error);
    }
  };

  const handleSavePDF = async () => {
    try {
      const exist = await exists("invoices", {
        baseDir: BaseDirectory.Document,
      });
      if (!exist) {
        await mkdir("invoices", {
          baseDir: BaseDirectory.Document,
        });
      }
      // Generate the PDF blob
      const blob = await pdf(<Document>{page}</Document>).toBlob();

      // Save the file using Tauri's API
      await writeFile(
        `invoices/invoice_${invoice.created_at.$date.$numberLong}.pdf`,
        new Uint8Array(await blob.arrayBuffer()),
        {
          baseDir: BaseDirectory.Document,
        }
      );
      // TODO: add alert dailaog or notafaction system
      alert("Invoice saved successfully!");
    } catch (error) {
      console.log("Error saving the invoice:", error);
    }
  };

  return (
    <>
      <Button onClick={handleSavePDF}>Download</Button>
      <Button onClick={handlePrintPDF}>Print Invoice</Button>
    </>
  );
};

export default InvoicePrint;
