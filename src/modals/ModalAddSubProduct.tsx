import {
  ColorPicker,
  Form,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import React, { useEffect, useState } from "react";
import { ProductModel, SubProductModel } from "../models/Products";
import { API, colors } from "../configurations/configurations";
import { uploadFiles } from "../utils/uploadFile";
import handleAPI from "../apis/handleAPI";

interface Props {
  visible: boolean;
  onClose: () => void;
  product?: ProductModel;
  onAddNew: (values: SubProductModel)=>void
}

const ModalAddSubProduct = (props: Props) => {
  const [color, setColor] = React.useState<string>('#1677ff');
  const [isLoading, setIsLoading] = useState(false);
  const { visible, onClose, product, onAddNew } = props;
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  useEffect(() => {
    
  }, []);
  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    
    
    
    onClose();
  };
  const handleSubmit = async (values: any) => {
    
    if (product){
      setIsLoading(true);
      values.productId=product.id;
      if (fileList && fileList.length > 0) {
        const files: any[] = [];
        let imagesUrl: string[] = [];
        fileList.forEach((file, _index) => {
          if (file.originFileObj) files.push(file.originFileObj);
          else imagesUrl.push(file.url);
        });
        if (files && files.length > 0) {
          const uploadedFilesUrl:string[] | null = await uploadFiles(files);
          if(uploadedFilesUrl&& uploadedFilesUrl.length>0){
            imagesUrl = [...imagesUrl, ...uploadedFilesUrl]; 
          }
        }
        if (imagesUrl && imagesUrl.length > 0) {
          values.images = imagesUrl;
        } else {
          setIsLoading(false);
          return;
        }
      }
      try {
        const res = await handleAPI(API.SUB_PRODUCTS, values, 'post');
        message.success('Add sub product successfully!');
        onAddNew(res.data.result);
        handleClose();
      } catch (error) {
        message.error('Error when adding sub product!');
        console.log(error);
      }finally{
        
        setIsLoading(false);
      }
    }else{
      message.error("Product miss!")
    }
  };
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    const items = newFileList.map(
      (item) =>
        item.originFileObj ? {
          ...item,
          url: item.originFileObj
            ? URL.createObjectURL(item.originFileObj)
            : "",
          status: "done",
        }: {...item}
    );
    setFileList(items);
  };
  return (
    <Modal
      onOk={form.submit}
      okButtonProps={{
        loading: isLoading
      }}
      title={"Add sub product"}
      open={visible}
      onCancel={handleClose}
      onClose={handleClose}
    >
      <Typography.Title level={5}>{product?.title}</Typography.Title>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        form={form}
        disabled={isLoading}
      >
        <Form.Item name="color" label="Color">
          <ColorPicker 
          defaultValue={color}
          onChange={(c) => {
            const hexColor = c.toHexString();
            setColor(hexColor);
            form.setFieldsValue({ color: hexColor }); // Cập nhật giá trị vào form
          }}
          />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "type device size",
            },
          ]}
          name="size"
          label="Size"
        >
          <Input allowClear />
        </Form.Item>
        <div className="row">
          <div className="col">
            <Form.Item name={"quantity"} label="Quantity">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <div className="col">
            <Form.Item name={"price"} label="Price">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </div>
        </div>
      </Form>
      <Upload
        multiple
        fileList={fileList}
        accept="image/*"
        listType="picture-card"
        onChange={handleChange}
      >
        Upload
      </Upload>
    </Modal>
  );
};

export default ModalAddSubProduct;
