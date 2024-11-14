import { Button } from "../ui/button";

export const PrintButton = ({ contentRef }) => {
  const handlePrint = () => {
    if (contentRef.current) {
      const printContent = contentRef.current.innerHTML;
      const newWindow = window.open("", "_blank");
      if (!newWindow) return;
      newWindow.document.write(printContent);
      newWindow.document.close();
      newWindow.print();
    }
  };

  return <Button onClick={handlePrint}>Print Invoice</Button>;
};
