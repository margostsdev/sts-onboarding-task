const TableHeaderRow = () => {
  const handlePriceHeaderClick = () => {
    console.log("Price column header clicked");
  };

  return (
    <s-table-header-row>
      <s-table-header>Product</s-table-header>
      <s-table-header>
        <s-clickable onClick={handlePriceHeaderClick}>
          <s-stack direction={"inline"}>
            Price
            <s-icon type="arrow-up" size={"small"} />
          </s-stack>
        </s-clickable>
      </s-table-header>
      <s-table-header>Inventory</s-table-header>
      <s-table-header>Status</s-table-header>
    </s-table-header-row>
  );
};

export default TableHeaderRow;
