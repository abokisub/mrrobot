/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  Button,
  Box,
} from '@mui/material';
import Iconify from '../../../components/Iconify';
// routes
import { PATH_ADMIN } from '../../../routes/paths';
// hooks
import useSettings from '../../../hooks/useSettings';
// components
import Page from '../../../components/Page';
import Scrollbar from '../../../components/Scrollbar';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
// axios
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'code', label: 'Bank Code', alignRight: false },
  { id: 'name', label: 'Bank Name', alignRight: false },
];

// ----------------------------------------------------------------------

export default function BellBankBanks() {
  const { themeStretch } = useSettings();
  const [bankList, setBankList] = useState([]);
  const [load, SetLoad] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const AccessToken = window.localStorage.getItem('accessToken');

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    SetLoad(true);
    try {
      const data = await axios.get('/api/bellbank/banks', {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });

      if (data.data?.status === 'success') {
        setBankList(data.data?.data || []);
      } else {
        setBankList([]);
        enqueueSnackbar(data.data?.message || 'Failed to fetch banks', { variant: 'error' });
      }
      SetLoad(false);
    } catch (error) {
      SetLoad(false);
      setBankList([]);
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to fetch banks', { variant: 'error' });
      }
    }
  };

  return (
    <Page title="BellBank: Banks List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="BellBank Supported Banks"
          links={[
            { name: 'Dashboard', href: PATH_ADMIN.root },
            { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
            { name: 'Banks List' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon={'eva:refresh-fill'} />}
              onClick={initialize}
            >
              Refresh
            </Button>
          }
        />

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableRow>
                  {TABLE_HEAD.map((headCell) => (
                    <TableCell key={headCell.id} align={headCell.alignRight ? 'right' : 'left'}>
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>

                {!load ? (
                  <TableBody>
                    {bankList.length > 0 ? (
                      bankList.map((row, index) => {
                        const { code, name } = row;
                        return (
                          <TableRow hover key={code || index} tabIndex={-1}>
                            <TableCell>{code || 'N/A'}</TableCell>
                            <TableCell align="left">{name || 'N/A'}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell align="center" colSpan={2} sx={{ py: 3 }}>
                          <Typography variant="body2">No banks found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={2} sx={{ py: 3 }}>
                      <Typography variant="body2">Loading ...</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>
        </Card>
      </Container>
    </Page>
  );
}

