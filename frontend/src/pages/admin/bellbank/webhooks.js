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
  TablePagination,
  Switch,
  Box,
  Chip,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
// routes
import { PATH_ADMIN } from '../../../routes/paths';
// hooks
import useSettings from '../../../hooks/useSettings';
// components
import Page from '../../../components/Page';
import Label from '../../../components/Label';
import Scrollbar from '../../../components/Scrollbar';
import SearchNotFound from '../../../components/SearchNotFound';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
// axios
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'event_type', label: 'Event Type', alignRight: false },
  { id: 'reference', label: 'Reference', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'created_at', label: 'Received Date', alignRight: false },
];

// ----------------------------------------------------------------------

export default function BellBankWebhooks() {
  const { themeStretch } = useSettings();
  const [webhookList, setWebhookList] = useState([]);
  const [page, setPage] = useState(0);
  const [load, SetLoad] = useState(true);
  const [totalPage, SetTotal] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, SetDense] = useState(false);
  const [isNotFound, SetNotFound] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const AccessToken = window.localStorage.getItem('accessToken');

  useEffect(() => {
    initialize(page, rowsPerPage, filterName);
  }, []);

  const initialize = async (pag, adex = 5, search) => {
    let adex_page;
    if (pag > page) {
      adex_page = pag + 1;
    } else {
      adex_page = pag;
    }
    SetLoad(true);
    try {
      const data = await axios.get(`/api/admin/bellbank/webhooks?page=${adex_page}&per_page=${adex}&search=${search || ''}`, {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });

      if (data.data?.status === 'success') {
        setWebhookList(data.data?.data?.data || []);
        SetTotal(data.data?.data?.total || 0);
        SetNotFound((data.data?.data?.total || 0) === 0);
      } else {
        setWebhookList([]);
        SetTotal(0);
        SetNotFound(true);
      }
      SetLoad(false);
      setPage(pag);
    } catch (error) {
      SetLoad(false);
      setWebhookList([]);
      SetTotal(0);
      SetNotFound(true);
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    initialize(0, event.target.value, filterName);
    setPage(0);
  };

  const handleFilterByName = async (filterName) => {
    setFilterName(filterName);
    setPage(0);
    initialize(0, rowsPerPage, filterName);
  };

  function handleChangeDense(event) {
    SetDense(event.target.checked);
  }

  return (
    <Page title="BellBank: Webhooks">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="BellBank Webhooks"
          links={[
            { name: 'Dashboard', href: PATH_ADMIN.root },
            { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
            { name: 'Webhooks' },
          ]}
        />

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table size={dense ? 'small' : 'medium'}>
                <TableRow>
                  {TABLE_HEAD.map((headCell) => (
                    <TableCell key={headCell.id} align={headCell.alignRight ? 'right' : 'left'}>
                      {headCell.label}
                    </TableCell>
                  ))}
                </TableRow>

                {!load ? (
                  <TableBody>
                    {webhookList.map((row) => {
                      const { id, event_type, reference, amount, status, created_at } = row;
                      return (
                        <TableRow hover key={id} tabIndex={-1}>
                          <TableCell>
                            <Chip label={event_type || 'N/A'} size="small" />
                          </TableCell>
                          <TableCell>{reference || 'N/A'}</TableCell>
                          <TableCell align="left">₦{amount ? amount.toLocaleString() : '0.00'}</TableCell>
                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={status === 'processed' ? 'success' : status === 'pending' ? 'warning' : 'error'}
                            >
                              {status || 'N/A'}
                            </Label>
                          </TableCell>
                          <TableCell align="left">
                            {created_at ? new Date(created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={5} sx={{ py: 3 }}>
                      <Typography variant="body2">Loading ...</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {isNotFound && !load && (
                  <TableRow>
                    <TableCell align="center" colSpan={5} sx={{ py: 3 }}>
                      <SearchNotFound searchQuery={filterName} />
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <FormControlLabel
            control={<Switch checked={dense} onChange={(event) => handleChangeDense(event)} />}
            label="Dense padding"
            align="left"
          />

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 100]}
            component="div"
            count={totalPage}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => initialize(page, rowsPerPage, filterName)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

