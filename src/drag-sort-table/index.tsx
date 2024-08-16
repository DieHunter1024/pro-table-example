import { DragSortTableProps } from '@/components/data-table/type';
import React, { useContext, useRef } from 'react';
import { EditableProTable, EditableProTableProps, ProTable, SzButton, CellEditorTable, SzFormObj, SzForm } from 'sz-components';
import { HolderOutlined } from '@ant-design/icons';
import './index.scss';

type DragSortDataTableProps<T = any> = {
  dragSortKey: string;
  TableElem?: React.ComponentType<any>;
} & DragSortTableProps<T>;
const DragHandle: React.FC = () => {
  return <SzButton type="text" size="small" icon={<HolderOutlined />} style={{ cursor: 'move' }} />;
};
const DragSortContext = React.createContext<any>({
  dragItem: null,
  dragOverItem: null,
  dragSource: null,
});
const DragSortTable = <T extends Record<string, any>>(props: DragSortDataTableProps<T>) => {
  const {
    dragSortKey,
    headerTitle,
    hideInTable,
    columns = [],
    dataSource = [],
    onDragStart,
    onDragSortEnd,
    TableElem = ProTable,
    ...rest
  } = props;

  const dragContext = useContext(DragSortContext);
  const tableRef = useRef<HTMLTableRowElement>(null);
  const handleDragStart = (index: any) => {
    dragContext.dragSource = onDragStart?.();
    dragContext.dragItem = index;
  };
  const handleDragEnter = (index: any) => {
    if (dragContext.dragOverItem === index) return;
    dragContext.dragOverItem = index;
    setClassName(index);
  };
  const setClassName = (index: any) => {
    if (!tableRef.current) return;
    const elems = tableRef.current?.querySelectorAll(`.drag-item`);
    const list = Array.from(elems);
    list.forEach(it => {
      it.classList.remove('drag-active');
    });
    const active = list?.[index];
    active?.classList?.add('drag-active');
  };
  const handleDragEnd = (index: any) => {
    const items: any[] = Array.from(dragContext.dragSource ?? dataSource);
    if (!items || !items?.length) return;
    const dragItemIndex = dragContext.dragItem;
    const dragOverItemIndex = dragContext.dragOverItem;
    if (dragItemIndex !== null && dragOverItemIndex !== null) {
      const [draggedItem] = items.splice(dragItemIndex, 1);
      items.splice(dragOverItemIndex, 0, draggedItem);
      onDragSortEnd?.(items);
    }
    setClassName(null);
    dragContext.dragItem = null;
    dragContext.dragOverItem = null;
  };

  const DraggableRow = (props: any) => {
    const { children } = props;
    const item: any = Array.from(children);
    const sort = item.find((it: any) => it.key === dragSortKey);
    const index = sort?.props?.index;
    return (
      <tr
        className={`drag-item`}
        draggable={dataSource?.length > 0}
        onDragStart={() => handleDragStart(index)}
        onDragEnter={() => handleDragEnter(index)}
        onDragEnd={handleDragEnd}
      >
        {children}
      </tr>
    );
  };
  const icon = {
    editable: false, // 设置此列为不可编辑
    key: 'sort',
    width: 80,
    render: () => <DragHandle />,
  };
  return (
    <DragSortContext.Provider value={dragContext}>
      <div ref={tableRef}>
        <TableElem<T>
          {...rest}
          columns={[icon, ...columns]}
          dataSource={dataSource}
          id="drag-sort-table"
          components={{
            body: {
              row: DraggableRow,
            },
          }}
        />
      </div>
    </DragSortContext.Provider>
  );
};

export const DragSortProTable = <T extends Record<string, any>>(props: DragSortDataTableProps<T>) => {
  return <DragSortTable {...props} TableElem={ProTable} />;
};

type DragSortEditTableProps<T = any> = {} & DragSortDataTableProps<T> & Omit<EditableProTableProps<T, any>, 'onChange'>;
export const DragSortEditTable = <T extends Record<string, any>>(props: DragSortEditTableProps<T>) => {
  return <DragSortTable {...props} TableElem={EditableProTable} />;
};

export const DragSortCellEditorTable = <T extends Record<string, any>>(props: DragSortEditTableProps<T>) => {
  const { name } = props;
  const form = SzFormObj.useFormInstance();
  const onDragStart = () => {
    if (name && form) return form.getFieldValue(name);
  };
  return <DragSortTable {...props} onDragStart={onDragStart} TableElem={CellEditorTable} />;
};
