const collectionOrder = require('../../models/order');

const fetchGraphData = async (duration) => {
    try {
        const initailDate = new Date(new Date().getTime() - duration * 24 * 60 * 60 * 1000)
        let data = await collectionOrder.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: initailDate,
                        $lt: new Date(2024 + 1, 0, 1)
                    }
                }
            },
            {
                $unwind: "$products"
            },
            {
                $group: {
                    _id: "$products.status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    label: "$_id",
                    value: "$count"
                }
            }, 
            {
                $sort: {
                    "label" : 1
                }
            }
        ])

        return data;
    } catch (error) {
        throw error; 
    }
};

const handleGraphRequest = async (req, res, graphType) => {
    try {
        const filter = req.query.filter
        console.log(filter, "filter")
        const duration = {
            day: 1, 
            week: 7, 
            month: 28, 
            year: 365
        }
        const data = await fetchGraphData(duration[filter]); 
        console.log("dataaaa",data);
        res.json(data); 
    } catch (error) {
        console.error(`Error fetching ${graphType} data:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const lineGraph = async (req, res) => {
    await handleGraphRequest(req, res, 'lineGraph');
};


const barGraph = async (req, res) => {
    await handleGraphRequest(req, res, 'barGraph');
};


const doughnutGraph = async (req, res) => {
    try {
        const topSellingProducts = await getTopSellingProducts();
        res.json(topSellingProducts); 
    } catch (error) {
        console.error("Error fetching top selling products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getTopSellingProducts = async () => {
    try {
       
        const topSellingProducts = await collectionOrder.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.p_name", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 } 
        ]);
        return topSellingProducts;
        
    } catch (error) {
        throw error; 
    }
};


const doughnutGraph2 = async (req, res) => {
    try {
        const topSellingCategory= await getTopSellingCategories()
        res.json(topSellingCategory); // Send the top selling products as JSON response
    } catch (error) {
        console.error("Error fetching top selling products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
const getTopSellingCategories = async () => {
    try {
          const topSellingCategories = await collectionOrder.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 } 
        ]);
        return topSellingCategories;
    } catch (error) {
        throw error; 
    }
};



module.exports = {
    lineGraph,
    barGraph,
    doughnutGraph,
    doughnutGraph2
};
