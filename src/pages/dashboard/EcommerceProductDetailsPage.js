import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Tab, Tabs, Card, Grid, Divider, Container, Typography, Stack } from '@mui/material';
// redux
import { useAuthContext } from '../../auth/useAuthContext';
import { useDispatch, useSelector } from '../../redux/store';
import { getProduct, addToCart, gotoStep } from '../../redux/slices/product';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import Markdown from '../../components/markdown';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import { SkeletonProductDetails } from '../../components/skeleton';
// sections
import {
  ProductDetailsSummary,
  ProductDetailsReview,
  ProductDetailsCarousel,
} from '../../sections/@dashboard/e-commerce/details';
import CartWidget from '../../sections/@dashboard/e-commerce/CartWidget';
import useGetCourse from '../../hooks/useGetCourse';
import axios from '../../utils/axios';
import { updateView } from '../../firebase/course';

// ----------------------------------------------------------------------

// const SUMMARY = [
//   {
//     title: '100% Original',
//     description: 'Chocolate bar candy canes ice cream toffee cookie halvah.',
//     icon: 'ic:round-verified',
//   },
//   {
//     title: '10 Day Replacement',
//     description: 'Marshmallow biscuit donut dragée fruitcake wafer.',
//     icon: 'eva:clock-fill',
//   },
//   {
//     title: 'Year Warranty',
//     description: 'Cotton candy gingerbread cake I love sugar sweet.',
//     icon: 'ic:round-verified-user',
//   },
// ];

// ----------------------------------------------------------------------

export default function EcommerceProductDetailsPage() {
  const { themeStretch } = useSettingsContext();

  const { user } = useAuthContext();

  const { name } = useParams();

  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const { checkout } = useSelector((state) => state.product);
  const [isLoading, setIsLoading] = useState(true);
  const [body, setBody] = useState('');

  const [currentTab, setCurrentTab] = useState('description');

  const [course] = useGetCourse({ id: name });
  console.log(course);

  useEffect(() => {
    if (course !== null && user !== null) {
      const { id } = course;
      const { uid } = user;
      const updateViewFunction = async () => {
        await updateView(id, uid, true);
      };
      setTimeout(() => {
        updateViewFunction();
      }, 2000);
    }
  }, [course, user]);

  useEffect(() => {
    const setData = async () => {
      setProduct(course);
      const textUrl = course.description;
      const response = await axios.get(textUrl);
      const text = response.data;
      setBody(text);
      setIsLoading(false);
    };
    if (course !== null) {
      setData();
    }
  }, [course]);

  const handleAddCart = (newProduct) => {
    dispatch(addToCart(newProduct));
  };

  const handleGotoStep = (step) => {
    dispatch(gotoStep(step));
  };

  const TABS = [
    {
      value: 'description',
      label: 'description',
      component: product ? <Markdown children={body} /> : null,
    },
    {
      value: 'reviews',
      label: `Reviews (${product ? product.reviews.length : ''})`,
      component: product ? <ProductDetailsReview product={product} /> : null,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`${product?.name || ''} | Minimal UI`}</title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Course Detail"
          links={[
            {
              name: 'Courses',
              href: PATH_DASHBOARD.eCommerce.root,
            },
            { name: product?.name },
          ]}
        />

        {product && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={7}>
                <ProductDetailsCarousel product={product} />
              </Grid>

              <Grid item xs={12} md={6} lg={5}>
                <ProductDetailsSummary
                  product={product}
                  cart={checkout.cart}
                  onAddCart={handleAddCart}
                  onGotoStep={handleGotoStep}
                />
              </Grid>
            </Grid>

            <Box sx={{ height: 40 }} />

            {/* <Box
              gap={5}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
              sx={{ my: 10 }}
            >
              {SUMMARY.map((item) => (
                <Box key={item.title} sx={{ textAlign: 'center' }}>
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      borderRadius: '50%',
                      color: 'primary.main',
                      bgcolor: (theme) => `${alpha(theme.palette.primary.main, 0.08)}`,
                    }}
                  >
                    <Iconify icon={item.icon} width={36} />
                  </Stack>

                  <Typography variant="h6" sx={{ mb: 1, mt: 3 }}>
                    {item.title}
                  </Typography>

                  <Typography sx={{ color: 'text.secondary' }}>{item.description}</Typography>
                </Box>
              ))}
            </Box> */}

            <Card>
              <Tabs
                value={currentTab}
                onChange={(event, newValue) => setCurrentTab(newValue)}
                sx={{ px: 3, bgcolor: 'background.neutral' }}
              >
                {TABS.map((tab) => (
                  <Tab key={tab.value} value={tab.value} label={tab.label} />
                ))}
              </Tabs>

              <Divider />

             {TABS.map(
                (tab) =>
                  tab.value === currentTab && (
                    <Box
                      key={tab.value}
                      sx={{
                        ...(currentTab === 'description' && {
                          p: 3,
                        }),
                      }}
                    >
                      {tab.component}
                    </Box>
                  )
              )} 
            </Card>
          </>
        )}

        {isLoading && <SkeletonProductDetails />}
      </Container>
    </>
  );
}
