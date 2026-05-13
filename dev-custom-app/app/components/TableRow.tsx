interface TableRowProps {
  id: string;
  imageUrl?: string;
  alt?: string | null;
  title: string;
  totalInventory: number;
  status: string;
  price: string;
}
const TableRow = ({ id, imageUrl, alt, title, totalInventory, status, price}: TableRowProps) => {
  return (
    <s-table-row>
      <s-table-cell>
        <s-stack direction={'inline'} gap={'small-200'} alignItems={'center'} inlineSize={'100%'}>
          {
            imageUrl? (
              <s-thumbnail
                alt={alt || title}
                src={imageUrl}
                size={"small"}
              />
            ) : (
              <s-stack border="base" borderRadius="base" blockSize="40px" inlineSize={'40px'} alignItems={'center'} justifyContent={'center'}>
                <s-icon type="image" color={'subdued'}/>
              </s-stack>
            )
          }
          <s-text>{title}</s-text>
        </s-stack>
      </s-table-cell>
      <s-table-cell>
        {price}
      </s-table-cell>
      <s-table-cell>
        {totalInventory}
      </s-table-cell>
      <s-table-cell>
        <s-badge tone="success">{status}</s-badge>
      </s-table-cell>
    </s-table-row>
  )
}

export default TableRow;
