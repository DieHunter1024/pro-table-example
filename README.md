# pro-table-example

基于 antd pro comp 实现的一个可拖拽可编辑表格组件，由于业务需求较多，只保留了部分代码

效果参考：example.gif

### drag-sort-table 是拖拽表格组件，内部拓展可编辑的表格组件，支持拖拽排序、编辑、删除等操作。

### score-point 是业务层表格组件

score-point.tsx 中的 ScorePointEditTable 就是拖拽组件
onBlur 和 onDragSortEnd 表示编辑和拖拽结束后的回调

### CellEditorTable.tsx 文件是官方的表格内部编辑源码，修改了一些逻辑，如：onBlur 函数的触发，onCell 函数切片兼容，item 可覆盖内部数据（editable 可覆盖）
