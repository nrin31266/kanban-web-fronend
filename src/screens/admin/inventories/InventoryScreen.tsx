import {
  Avatar,
  Button,
  Image,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  CategoryModel,
  ProductModel,
  SubProductModel,
} from "../../../models/Products";
import handleAPI from "../../../apis/handleAPI";
import { API, colors } from "../../../configurations/configurations";
import { ColumnProps, TableProps } from "antd/es/table";
import { Link, useNavigate } from "react-router-dom";
import { listColors } from "../../../constants/listColors";
import { MdLibraryAdd } from "react-icons/md";
import { ModalAddSubProduct } from "../../../modals";
import { Edit2, Sort, Trash } from "iconsax-react";
import { TiTick } from "react-icons/ti";
import { PaginationResponseModel } from "../../../models/AppModel";
import { replaceName } from "../../../utils/replaceName";
const { confirm } = Modal;

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

const InventoryScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitLoading, setIsInitLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [isVisibleModalAddSubProduct, setIsVisibleModalAddSubProduct] =
    useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [productSelected, setProductSelected] = useState<ProductModel>();

  const [paginationPage, setPaginationPage] = useState<number>(1);
  const [paginationSize, setPaginationSize] = useState<number>(10);
  const [allowSelectRows, setAllowSelectRows] = useState<boolean>(false);

  const [total, setTotal] = useState<number>(0);
  const [searchKey, setSearchKey] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    let api;
    if (searchKey.length >= 4) {
      api = `${API.PRODUCTS}/data?title=${searchKey}&page=${paginationPage}&size=${paginationSize}`;
    } else {
      api = `${API.PRODUCTS}/data?page=${paginationPage}&size=${paginationSize}`;
    }
    console.log("useEffect triggered with api:", api);
    getProducts(api);
  }, [paginationPage, paginationSize, searchKey]);

  const handleSearchProduct = (key: string) => {
    
    if (key.trim() === "") {
      return;
    }
    if (key.length < 4) {
      message.warning("Please enter at least 4 characters to search!");
      return;
    }

    let keySearch:string = replaceName(key);
    console.log("Key search:", keySearch);
    if(keySearch===searchKey){return;}
    setIsLoading(true);
    setPaginationPage(1);
    setSearchKey(keySearch);
    
  };

  const getProducts = async (api?: string) => {
    setIsLoading(true);
    console.log("getProducts called, api:", api);
    if (!api) {
      api = `${API.PRODUCTS}/data?page=${paginationPage}&size=${paginationSize}`;
    }
    
    console.log("isLoading set to true");
    try {
      const res = await handleAPI(api);
      const paginationRes: PaginationResponseModel = res.data.result;

      setProducts(
        paginationRes.data.map((item: ProductModel) => ({
          ...item,
          key: item.id,
        }))
      );
      console.log(paginationRes.data);
      setTotal(paginationRes.totalElements);
    } catch (error) {
      console.log(error);
    } finally {
      console.log("isLoading set to false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log(selectedRowKeys);
  }, [selectedRowKeys]);

  const handleSoftRemoveProduct = async (productIds: string[]) => {
    setIsLoading(true);
    try {
      const res = await handleAPI(
        `${API.PRODUCTS}/soft-delete`,
        { ids: productIds },
        "put"
      );
      message.success(res.data.message);
      getProducts();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSelectAll = async () => {
    setAllowSelectRows(true);
    let api = `${API.PRODUCTS}/data`;
    setIsLoading(true);
    try {
      const res = await handleAPI(api);
      const paginationRes: PaginationResponseModel = res.data.result;
      if (paginationRes.data.length > 0) {
        const listKeys: string[] = paginationRes.data.map(
          (item: ProductModel) => item.id
        );
        setSelectedRowKeys(listKeys);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const rowSelection: TableRowSelection<ProductModel> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns: ColumnProps<ProductModel>[] = [
    {
      key: "index",
      dataIndex: undefined,
      width: 60,
      title: "#",
      render: (_, __, index) => {
        return (paginationPage - 1) * paginationSize + (index + 1);
      },
    },
    {
      key: "title",
      dataIndex: "",
      title: "Title",
      width: 190,
      render: (item: ProductModel) => (
        <Link to={`/inventory/detail/${item.slug}?id=${item.id}`}>
          {item.title}
        </Link>
      ),
    },
    {
      key: "description",
      dataIndex: "description",
      title: "Description",
      width: 250,
      render: (description) => (
        <Tooltip title={description}>
          <div className="text-2-line">{description}</div>
        </Tooltip>
      ),
    },
    {
      key: "images",
      dataIndex: "images",
      title: "Image",
      width: 285,
      render: (images: string[]) =>
        images && images.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap", // Cho phép hình ảnh tự động xuống hàng
              gap: "4px", // Khoảng cách giữa các hình ảnh
            }}
          >
            {images.map((img, index) => (
              <Image
                key={`image-${index}`}
                src={img}
                width={"48px"}
                height={"48px"}
                style={{
                  borderRadius: "10px",
                  border: "1px solid silver",
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-secondary">No image</span>
        ),
    },
    {
      key: "categories",
      dataIndex: "categories",
      title: "Categories",
      width: 300,
      render: (categories: CategoryModel[]) =>
        categories &&
        categories.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap", // Cho phép hình ảnh tự động xuống hàng
              gap: "4px", // Khoảng cách giữa các hình ảnh
            }}
          >
            {categories.map((category: CategoryModel, _index) => (
              <Link to={"/categories/detail/${item.slug}?id=${item.key}"}>
                <Tag
                  style={{
                    margin: "0",
                    padding: "5px",
                    fontSize: "15px",
                  }}
                  // color={
                  //   listColors[Math.floor(Math.random() * listColors.length)]
                  // }
                >
                  {category.name}
                </Tag>
              </Link>
            ))}
          </div>
        ),
    },

    {
      key: "colors",
      dataIndex: "subProductResponse",
      title: "Color",
      width: 200,
      render: (items: SubProductModel[]) => {
        if (!items || items.length === 0) {
          return <span className="text-secondary">No color</span>;
        }

        const colors: string[] = [];

        items.forEach((sub) => {
          if (!colors.includes(sub.color)) {
            colors.push(sub.color);
          }
        });

        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {colors.map(
              (color, index) =>
                color && (
                  <div
                    style={{
                      margin: "2px",
                      width: 30,
                      height: 30,
                      backgroundColor: color,
                      borderRadius: "5%",
                      border: "1px solid black",
                    }}
                    key={`color-${color}-${index}`}
                  />
                )
            )}
          </div>
        );
      },
    },

    {
      key: "sizes",
      dataIndex: "subProductResponse",
      title: "Sizes",
      width: 300,
      render: (items: SubProductModel[]) => {
        if (!items || items.length === 0) {
          return <span className="text-secondary">No size</span>;
        }
        return (
          <Space wrap>
            {items.length > 0 &&
              items.map((item, index) => (
                <Tag
                  style={{
                    margin: "0",
                    padding: "5px",
                    fontSize: "15px",
                  }}
                  key={`size${item.size}-${index}`}
                >
                  {item.size}
                </Tag>
              ))}
          </Space>
        );
      },
    },
    {
      key: "prices",
      dataIndex: "subProductResponse",
      title: "Prices",
      width: 250,
      render: (items: SubProductModel[]) => {
        if (!items || items.length === 0) {
          return <span className="text-secondary">N/A</span>;
        }

        // Nếu chỉ có một item, trả về giá trị price của item đó
        if (items.length === 1) {
          return items[0].price.toLocaleString();
        }

        // Tìm giá trị nhỏ nhất và lớn nhất của price
        const prices = items
          .filter((item) => item.price) // Lọc các item có giá trị price
          .map((item) => item.price); // Lấy danh sách các price

        if (prices.length === 0) {
          return ""; // Không có giá trị price hợp lệ
        }

        const minPrice = Math.min(...prices).toLocaleString();
        const maxPrice = Math.max(...prices).toLocaleString();

        // Nếu min và max bằng nhau, chỉ hiển thị một giá trị, ngược lại hiển thị range
        return minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`;
      },
    },

    {
      key: "quantity",
      dataIndex: "subProductResponse",
      title: "Quantity",
      width: 200,
      render: (items: SubProductModel[]) => {
        if (!items || items.length === 0) {
          return <span className="text-secondary">0</span>;
        }

        let quantity = 0;

        items.forEach((item) => {
          if (item.quantity) {
            quantity += item.quantity;
          }
        });

        return quantity;
      },
    },

    {
      key: "action",
      dataIndex: "",
      width: 100,
      title: "Action",
      render: (product: ProductModel) => (
        <Space>
          <Tooltip title={"Add sub product"} key={"addSubProduct"}>
            <Button
              className="p-0"
              size="small"
              type="text"
              onClick={() => {
                setIsVisibleModalAddSubProduct(true);
                setProductSelected(product);
              }}
            >
              <MdLibraryAdd color={colors.primary500} size={20} />
            </Button>
          </Tooltip>
          <Tooltip title={"Edit product"} key={"btnEdit"}>
            <Button
              className="p-0"
              size="small"
              type="text"
              onClick={() => {
                setProductSelected(product);
                navigate(`/inventory/add-product?id=${product.id}`);
                console.log(productSelected);
              }}
            >
              <Edit2 className="text-primary" size={20} />
            </Button>
          </Tooltip>
          <Tooltip title={"Delete product"} key={"btnDelete"}>
            <Button
              className="p-0"
              size="small"
              type="text"
              onClick={() => {
                confirm({
                  title: "Confirm",
                  content:
                    "Are you sure to delete the product, any by-products will be lost!",
                  onOk: () => handleSoftRemoveProduct([product.id]),
                  onCancel: () => console.log("Cancel"),
                });
              }}
            >
              <Trash className="text-danger" size={20} />
            </Button>
          </Tooltip>
        </Space>
      ),
      fixed: "right",
    },
  ];

  return (
    <>
      <div className="col">
        <div className="row">
          <div className="col text-left">
            <div className="row">
              <Typography.Title className="mb-0" level={4}>
                Products
              </Typography.Title>
            </div>
            <div className="row">
              <Space>
                {
                  <Button
                    type="text"
                    className="text-primary p-0"
                    style={{
                      height: "auto",
                    }}
                    onClick={() => {
                      if (allowSelectRows) {
                        setAllowSelectRows(false);
                        setSelectedRowKeys([]);
                      } else setAllowSelectRows(true);
                    }}
                  >
                    Allow select{" "}
                    {allowSelectRows && (
                      <TiTick className="text-primary p-0" size={15} />
                    )}
                  </Button>
                }
                {selectedRowKeys.length > 0 && (
                  <>
                    <Typography.Text>
                      {selectedRowKeys.length} items selected
                    </Typography.Text>
                    <Tooltip title="Delete products">
                      <Button
                        style={{
                          height: "auto",
                        }}
                        type="text"
                        className="text-danger p-0"
                        onClick={() => {
                          confirm({
                            title: "Confirm",
                            content: "Delete all rows selected?",
                            onCancel: () => console.log("Cancel"),
                            onOk: () => {
                              handleSoftRemoveProduct(
                                selectedRowKeys as string[]
                              );
                              setSelectedRowKeys([]);
                            },
                          });
                        }}
                      >
                        Delete rows selected
                      </Button>
                    </Tooltip>
                  </>
                )}
                {allowSelectRows &&
                  selectedRowKeys.length > -1 &&
                  selectedRowKeys.length < total && (
                    <Button
                      style={{
                        height: "auto",
                      }}
                      className="p-0"
                      type="link"
                      onClick={handleSelectAll}
                    >
                      Select all
                    </Button>
                  )}
              </Space>
            </div>
          </div>
          <div className="col text-right">
            <Space className="mt-2">
              <Input.Search
                allowClear={true}
                onClear={() => {
                  getProducts();
                  setSearchKey("");
                }}
                placeholder="Search"
                onSearch={(key: string) => {
                  handleSearchProduct(key);
                }}
                className=""
              />
              <Button className="btn-primary">Add product</Button>
              <Button className="btn-text">
                Filter <Sort />
              </Button>
            </Space>
          </div>
        </div>
        <div className="row">
          <Table
            loading={isLoading}
            pagination={{
              current: paginationPage,
              showQuickJumper: false,
              showSizeChanger: true,
              onShowSizeChange: (_current, size) => {
                setIsLoading(true);
                setPaginationSize(size);
                
              },
              total: total,
              onChange: (page, _pageSize) => {
                setIsLoading(true);
                setPaginationPage(page);
                
              },
            }}
            rowSelection={allowSelectRows ? rowSelection : undefined}
            bordered
            dataSource={products}
            columns={columns}
            scroll={{
              y: "calc(100vh - 245px)",
            }}
          ></Table>
        </div>
      </div>
      <ModalAddSubProduct
        onAddNew={(values: SubProductModel) => {
          getProducts();
        }}
        product={productSelected}
        onClose={() => {
          setIsVisibleModalAddSubProduct(false);
          setProductSelected(undefined);
        }}
        visible={isVisibleModalAddSubProduct}
      />
    </>
  );
};

export default InventoryScreen;
