
const BannerDB=require("../../models/bannerdb")


const BannerList = async(req,res)=>{
    try {
                const BannerList = await BannerDB.find({});
        
        res.render('admin/banner', { Banner: BannerList });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

const AddBanner=async(req,res)=>{
    res.render('admin/AddBanner')
}

const AddBannerPost = async (req, res) => {
    try {
        const { bannername } = req.body;
        const imageFiles = req.files; 
        console.log(imageFiles);
        const imageUrl = imageFiles.map(file => file.path);

        const newBanner = new BannerDB({
            bannername,
             imageUrl,
            status: 'active'
        });

        await newBanner.save();

        res.redirect('/admin/banner');
    } catch (error) {
        console.error('Error adding banner:', error);
        res.status(500).send('Error adding banner. Please try again.'); 
    }
};

const DeleteBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        await BannerDB.findByIdAndDelete(bannerId);
        res.redirect('/admin/banner');
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).send('Error deleting banner. Please try again.');
    }
};

const BlockBanner = async (req, res) => {
    try {
        const bannerId = req.params.id;
        const banner = await BannerDB.findById(bannerId);
        banner.status = banner.status === 'active' ? 'blocked' : 'active';
        await banner.save();
        res.redirect('/admin/banner');
    } catch (error) {
        console.error('Error blocking/unblocking banner:', error);
        res.status(500).send('Error blocking/unblocking banner. Please try again.');
    }
};

module.exports={
    BannerList,AddBanner,AddBannerPost,DeleteBanner,BlockBanner
}