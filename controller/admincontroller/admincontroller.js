const collectionModel = require("../../models/userdb");
const collectionProduct = require("../../models/product");
const collectionOrder = require("../../models/order");
const PDFDocument = require("pdfkit");
const excelJS = require("exceljs");

const login = (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin/home");
  } else {
    res.render("admin/login");
  }
};

const loginpost = (req, res) => {
  const name = "admin@gmail.com";
  const password = "admin@123";
  console.log(req.body);
  if (name === req.body.username && password === req.body.password) {
    console.log("here in login post");
    //adding session
    req.session.admin = req.body.username;

    res.redirect("/admin/home");
  } else {
    res.send("wrong data....");
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/admin/login");
  });
};

const home = async (req, res) => {
  try {
    if (req.session.admin) {
      const topSellingProducts = await fetchTopSellingProducts();

      const topSellingCategories = await fetchTopSellingCategories();

      const orderData = await collectionOrder.find();
      const userCount = await collectionModel.countDocuments();
      const productCount = await collectionProduct.countDocuments();
      const totalAmount = orderData.reduce((acc, item) => acc + Number(item.payment.amount), 0);
      const orderCount = orderData.length;

      res.render("admin/home", {
        topSellingProducts,
        topSellingCategories,
        totalAmount,
        userCount,
        productCount,
        orderCount,
      });
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.error("Error in rendering admin home:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchTopSellingProducts = async () => {
  const topSellingProducts = await collectionOrder.aggregate([
    { $unwind: "$products" },
    { $group: { _id: "$products.p_name", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  return topSellingProducts;
};

const fetchTopSellingCategories = async () => {
  try {
    const topSellingCategories = await collectionOrder.aggregate([
      { $unwind: "$products" },
      { $group: { _id: "$products.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    return topSellingCategories;
  } catch (error) {
    throw error;
  }
};

const user = async (req, res) => {
  try {
    const searchQuery = req.query.username || "";
    const userDetails = await collectionModel.find({
      name: { $regex: searchQuery, $options: "i" },
    });

    console.log(searchQuery);
    res.render("admin/user", { userDetails, searchQuery });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const isBlocked = async (req, res) => {
  try {
    const username = req.params.id;
    console.log(req.params.id);
    const user = await collectionModel.updateOne({ email: username }, { $set: { isBlocked: true } });
    console.log(user);
    res.redirect("/admin/user");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

const notBlocked = async (req, res) => {
  try {
    const username = req.params.id;
    await collectionModel.updateOne(
      { email: username },
      {
        $set: {
          isBlocked: false,
        },
      }
    );
    res.redirect("/admin/user");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};
// user ends
const order = async (req, res) => {
  const orderList = await collectionOrder.find();
  const user = orderList.map((item) => item.userId);
  const userData = await collectionModel.find({ _id: { $in: user } });

  const ordersWithData = orderList.map((order) => {
    const user = userData.find((user) => user._id.toString() === order.userId.toString());
    return {
      ...order.toObject(),
      user: user,
    };
  });
  const ordersWithDataSorted = ordersWithData.sort((a, b) => b.createdAt - a.createdAt);

  res.render("admin/order", { ordersWithDataSorted });
};

const orderput = async (req, res) => {
  try {
    const status = req.body.status;
    const { itemId, orderId } = req.params;
    const order = await collectionOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const item = order.products.find((item) => item._id.toString() === itemId.toString());
    const product = await collectionProduct.findById(item.p_id);

    product.Stock += item.quantity;
    const user = await collectionModel.findById(order.userId);

    user.walletbalance = item.realPrice * item.quantity + user.walletbalance;
    user.wallethistory.push({
      process: "return from the admin",
      amount: item.realPrice * item.quantity,
    });
    if (!item) {
      return res.status(404).json({ error: "Item not found in the order" });
    }
    item.status = status;
    await order.save();
    await user.save();
    await product.save();
    res.json(status);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json("Error updating order status");
  }
};

// banner

const sales = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    let salesReport = [];
    const query = {};

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }
    const orderList = await collectionOrder.find(query);
    salesReport = orderList.map((order) => {
      let orderDetails = {};
      order.products.forEach((productList) => {
        order.proCartDetail.forEach((value) => {
          orderDetails = {
            p_name: productList.p_name,
            address: order.address,
            quantity: productList.quantity,
            price: productList.realPrice,
            createdAt: order.createdAt,
            totalprice: value.OriginalPrice,
            paymentMethod: order.payment,
          };
        });
      });

      orderDetails.payment = order.payment;
      return orderDetails;
    });
    console.log(salesReport, "sales report new object");
    req.session.salesReport = salesReport;

    res.render("admin/sales", { salesReport });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).send("Internal server error");
  }
};

const generatePDF = async (req, res) => {
  try {
    const doc = new PDFDocument();

    const salesReport = req.session.salesReport;
    const username = req.session.username;
    if (!Array.isArray(salesReport)) {
      salesReport = [];
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="sales_report.pdf"');
    doc.pipe(res);

    // Styling
    doc.font("Helvetica-Bold");
    const headerColor = "#333";
    const rowColor = "#666";

    // Add content to the PDF document
    doc.fontSize(24).fillColor(headerColor).text("iStore", { align: "center" }).moveDown();
    doc.fontSize(20).fillColor(headerColor).text("Sales Report", { align: "center" }).moveDown();

    for (let i = 0; i < salesReport.length; i++) {
      const report = salesReport[i];

      const paymentMethod = report.payment.method
        .map((x) => {
          return x.mode;
        })
        .join(" ,");

      doc.moveDown().fillColor(rowColor);
      doc.text(`Product Name: ${report.p_name}`);
      doc.text(`Price: ${report.price}`);

      if (report.totalprice !== undefined) {
        doc.text(`OfferPrice: ${report.payment.method.reduce((acc, x) => acc + parseFloat(x.amount), 0)}`);

        doc.text("Offer Price: Not Available");
      }
      doc.text(`Quantity: ${report.quantity}`);

      if (report.address && report.address.length > 0) {
        const address = report.address[0];
        doc.text(`Customer Name: ${address.name}`);
        doc.text(`House Name: ${address.houseName}`);
        doc.text(`City: ${address.city}`);
        doc.text(`City: ${address.phone}`);
        doc.text(`Postal Code: ${address.postalCode}`);
      } else {
        doc.text("Address Not Available");
      }

      const formattedDate = new Date(report.createdAt).toLocaleDateString("en-GB");

      doc.text(`Date of Purchase: ${formattedDate}`);
      doc.text(`Payment Method: ${paymentMethod}`);
      doc
        .strokeColor(rowColor)
        .lineWidth(1)
        .moveTo(50, doc.y + 15)
        .lineTo(550, doc.y + 15)
        .stroke();
    }

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};

const downloadExcel = async (req, res) => {
  try {
    const salesReport = req.session.salesReport;

    if (!Array.isArray(salesReport) || salesReport.length === 0) {
      throw new Error("Data is empty or not an array");
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Product Name", key: "p_name", width: 20 },
      { header: "Date", key: "createdAt", width: 15 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Price", key: "price", width: 15 },
      { header: "Offer Price", key: "totalprice", width: 15 },
      { header: "Customer Name", key: "customerName", width: 20 },
      { header: "House Name", key: "houseName", width: 20 },
      { header: "City", key: "city", width: 15 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Postal Code", key: "postalCode", width: 15 },
      { header: "Payment Method", key: "paymentMethod", width: 20 },
    ];

    salesReport.forEach((item) => {
      const address = item.address && item.address.length > 0 ? item.address[0] : {};

      const formattedDate = item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : "";

      const paymentMethod = item.payment.method.map((x) => {
        return x.mode;
      });

      worksheet.addRow({
        p_name: item.p_name || "",
        createdAt: formattedDate,
        quantity: item.quantity || "",
        price: item.price || "",
        totalprice: item.totalprice || "",
        customerName: address.name || "",
        houseName: address.houseName || "",
        city: address.city || "",
        phone: address.phone || "",
        postalCode: address.postalCode || "",
        paymentMethod: paymentMethod.join(", "),
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error("Error generating Excel:", error.message);
    res.status(500).send("Internal Server Error: " + error.message);
  }
};

module.exports = {
  login,
  loginpost,
  logout,
  home,
  user,
  isBlocked,
  notBlocked,
  order,
  orderput,
  sales,
  generatePDF,
  downloadExcel,
};
