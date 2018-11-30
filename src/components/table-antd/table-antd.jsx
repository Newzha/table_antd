import React, {Component} from 'react'

import {Table, Input, Button, Popconfirm, Form, Select, Icon} from 'antd';
// import EditableCell from '../edit-table-cell/edit-table-cell'

import 'antd/dist/antd.css'
import './table-antd.css'

const FormItem = Form.Item;
const EditableContext = React.createContext();
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
  state = {
    editing: false,
  }

  componentDidMount() {
    if (this.props.editable) {
      document.addEventListener('click', this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.props.editable) {
      document.removeEventListener('click', this.handleClickOutside, true);
    }
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
      this.save();
    }
  }

  save = () => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  }

  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      ...restProps
    } = this.props;
    return (
      <td ref={node => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                editing ? (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      rules: [{
                        required: true,
                        message: `${title} is required.`,
                      }],
                      initialValue: record[dataIndex],
                    })(
                      <Input
                        ref={node => (this.input = node)}
                        onPressEnter={this.save}
                      />
                    )}
                  </FormItem>
                ) : (
                  <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                  >
                    {restProps.children}
                  </div>
                )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}

export default class TableEdit extends Component {
  constructor(props) {
    super(props);
    this.columns = [{
      title: '删除货运项',
      dataIndex: 'operation',
      render: (text, record) => {
        return (
          this.state.data.length >= 1
            ? (
              <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
                <a href="javascript:;">删除</a>
              </Popconfirm>
            ) : '暂无数据，请添加'
        );
      },
    }, {
      title: '受理号',
      dataIndex: 'number',
      width: 160,
      editable: true,
      /* filters: [{
         text: 'Joe',
         value: 'Joe',
       }, {
         text: 'Jim',
         value: 'Jim',
       }, {
         text: 'Submenu',
         value: 'Submenu',
         children: [{
           text: 'Green',
           value: 'Green',
         }, {
           text: 'Black',
           value: 'Black',
         }],
       }],*/
      // specify the condition of filtering result
      // here is that finding the name started with `value`
      onFilter: (value, record) => record.number.indexOf(value) === 0,
      // sorter: (a, b) => a.number.length - b.number.length,
      sorter: (a, b) => a.number - b.number,
    }, {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      editable: true,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.type - b.type,
    }, {
      title: '发站',
      dataIndex: 'start',
      width: 200,
      // editable: true,
      /*  filters: [{
          text: 'London',
          value: 'London',
        }, {
          text: 'New York',
          value: 'New York',
        }],*/
      filterMultiple: false,
      // onFilter: (value, record) => record.start.indexOf(value) === 0,
      // sorter: (a, b) => a.start.length - b.start.length,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="custom-filter-dropdown">
          <Input
            ref={ele => this.searchInput = ele}
            placeholder="请输入搜索内容"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={this.handleSearch(selectedKeys, confirm)}
          />
          <Button type="primary" onClick={this.handleSearch(selectedKeys, confirm)}>确定</Button>
          <Button onClick={this.handleReset(clearFilters)}>取消</Button>
        </div>
      ),
      filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#108ee9' : '#aaa' }} />,
      onFilter: (value, record) => record.start.toLowerCase().includes(value.toLowerCase()),
      onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            this.searchInput.focus();
          });
        }
      },
      render: (text ,index) => {
        const { searchText, data } = this.state;
        const Option = Select.Option;
        const start = data.map(s => s.start) ;
        console.log(start);
        const key = data.map(s => s.key) ;
        console.log(key);
        // const children = [];
        // for (let i = 10; i < 36; i++) {
        //   children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
        // }
        const children = [];
        for (let i = 0; i < start.length; i++) {
          children.push(<Option key={i}>{start[i]}</Option>);
          // console.log(children)
        }
        // const children = data.map((s, index) => (<Option key={s.index}>{s.start}</Option>))
        //  const index = data.findIndex(item => item.key ===item.key);
        // console.log(index)
        //  const datastart = data[index];
        // const dataStart = data.filter((s, index) => s.key === index ? s.start : '')
        return  searchText ? (
          <span>
            {text.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((fragment, i) => (
              fragment.toLowerCase() === searchText.toLowerCase()
                ? <span key={i} className="highlight">{fragment}</span> : fragment // eslint-disable-line
            ))}
          </span>
        ) : text,
          <Select
            // mode="tags"
            // mode="multiple"
            style={{ width: '100%' }}
            // placeholder={'mmp'}
            // defaultValue={['a10', 'c12']}
            //  defaultValue={ start[0] }
            // defaultValue={datastart}
            //  key={index}
            // value = {start[this.index]}
            // defaultValue={start[this.index]}
            onChange={this.handleChange}
            labelInValue={true}
          >
            {children}
          </Select>
          /*(data.map((s, index) => (
            <Select
              // mode="tags"
              style={{ width: '100%' }}
              // placeholder={'mmp'}
              // defaultValue={['a10', 'c12']}
              // defaultValue={data.map((s) => s.start)}
              defaultValue={ s.start }
              key={index}
              // value = {start[this.index]}
              // defaultValue={start[this.index]}
              onChange={this.handleChange}
            >
              {children}
            </Select>
          )))*/
      },
     /* render() {
        return (
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Tags Mode"
            onChange={this.handleChange}
          >
            {children}
          </Select>
        )
      }*/
    }, {
      title: '发货人',
      dataIndex: 'consignor',
      defaultSortOrder: 'descend',
      editable: true,
    }, {
      title: '收货人',
      dataIndex: 'consignee',
      defaultSortOrder: 'descend',
    }, {
      title: '到站',
      dataIndex: 'arrive-station',
      defaultSortOrder: 'descend',
    }, {
      title: '到局',
      dataIndex: 'arrive',
      defaultSortOrder: 'descend',
    }, {
      title: '品名',
      dataIndex: 'goods',
      defaultSortOrder: 'descend',
    }, {
      title: '品类',
      dataIndex: 'class',
      defaultSortOrder: 'descend',
    }, {
      title: '需求车数',
      dataIndex: 'demand-car',
      defaultSortOrder: 'descend',
    }, {
      title: '需求车种',
      dataIndex: 'need-car-type',
      defaultSortOrder: 'descend',
    }, {
      title: '受理车数',
      dataIndex: 'accept-car-number',
      defaultSortOrder: 'descend',
    }, {
      title: '受理车种',
      dataIndex: 'accept-car-type',
      defaultSortOrder: 'descend',
    }, {
      title: '装车数',
      dataIndex: 'loading-number',
      defaultSortOrder: 'descend',
    }, {
      title: '装车种',
      dataIndex: 'load-car-type',
      defaultSortOrder: 'descend',
    }, {
      title: '夜班计划',
      dataIndex: 'night-plan',
      defaultSortOrder: 'descend',
    }, {
      title: '货运收入',
      dataIndex: 'goods-traffic-revenue',
      defaultSortOrder: 'descend',
    }, {
      title: '货区货位',
      dataIndex: 'area position',
      defaultSortOrder: 'descend',
    }, {
      title: '月受理数',
      dataIndex: 'month-to-accept',
      defaultSortOrder: 'descend',
    }, {
      title: '车次',
      dataIndex: 'trains',
      defaultSortOrder: 'descend',
    }, {
      title: '装车吨数',
      dataIndex: 'loading-tonnage',
      defaultSortOrder: 'descend',
    }];

    this.state = {
      data : [{
        key: '0',
        number: '136000',
        type: '0',
        start: '乌鲁木齐',
      }, {
        key: '1',
        number: '136001',
        type: '1',
        start: '西安',
      }, {
        key: '2',
        number: '136002',
        type: '1',
        start: '云南',
      }, {
        key: '3',
        number: '136003',
        type: '0',
        start: '新疆',
      }],
      count: 4,
      searchText: '',
    }
  }

  handleChange = ( value) => {
    const chooseOp = JSON.stringify(value)
    // console.log(chooseOp)
    console.log(`selected ${JSON.stringify(value)}`);
    const startData = [...this.state.data]
    console.log(startData)
    const index = startData.findIndex(item => chooseOp.key === item.key);
    const item = startData[index];
    // startData.splice(value, 1, {
    //     ...item,
    // });
    // this.setState({startData: startData.splice(value, 1, item)})

    // const newData = [...this.state.data];
    // console.log(newData)
    // const index = newData.findIndex(item => row.key === item.key);
    // console.log('index'+index)
    // const item = newData[index];
    // console.log("item"+item)
    // newData.splice(index, 1, {
    //   ...item,
    //   ...row,
    // });
    // this.setState({ data: newData });

    // for (var value in startData) {
    //   console.log(startData[value])
    // }
    // this.setState({startData: startData.splice(value, 1, chooseOp.label)})
  }

  handleSearch = (selectedKeys, confirm) => () => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = clearFilters => () => {
    clearFilters();
    this.setState({ searchText: '' });
  }


  handleDelete = (key) => {
    const data = [...this.state.data];
    this.setState({ data: data.filter(item => item.key !== key) });
  }

  handleAdd = () => {
    const { count, data } = this.state;
    const newData = {
      key: count,
      number: `13600${count}`,
      start: `北京 no. ${count}`,
      type: 1,
    };
    this.setState({
      data: [...data, newData],
      count: count + 1,
    });
  }

  handleSave = (row) => {
    console.log(row) //点击的当前行data
    const newData = [...this.state.data]; //获取stata状态中的data
    console.log(newData)
    const index = newData.findIndex(item => row.key === item.key); //得到点击的当前行index
    console.log('index'+index)
    const item = newData[index]; //匹配对应的item
    console.log("item"+item)
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ data: newData });
  }


  onChange = (pagination, filters, sorter) => {
    console.log('params', pagination, filters, sorter);
  }

  render() {
    const { data } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div className="table">
        <p className="title">运货五</p>
        <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 3 }}>
          添加运货项
        </Button>
        <Table
          scroll={{x: 2000}}
          components={components}
          rowClassName={() => 'editable-row'}
          bordered

          columns={columns}
          dataSource={data}
          onChange={this.onChange}></Table>
      </div>
    )
  }
}