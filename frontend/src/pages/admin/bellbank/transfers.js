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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Box,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormControlLabel from '@mui/material/FormControlLabel';
import Iconify from '../../../components/Iconify';
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
// format number 
import { fCurrency } from '../../../utils/formatNumber';
// axios
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'reference', label: 'Reference', alignRight: false },
  { id: 'user', label: 'User', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'destination', label: 'Destination Account', alignRight: false },
  { id: 'narration', label: 'Narration', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'created_at', label: 'Date', alignRight: false },
];

// ----------------------------------------------------------------------

export default function BellBankTransfers() {
  const { themeStretch } = useSettings();
  const [transferList, setTransferList] = useState([]);
  const [page, setPage] = useState(0);
  const [load, SetLoad] = useState(true);
  const [totalPage, SetTotal] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, SetDense] = useState(false);
  const [isNotFound, SetNotFound] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [transferForm, setTransferForm] = useState({
    beneficiary_bank_code: '',
    beneficiary_account_number: '',
    amount: '',
    narration: '',
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const AccessToken = window.localStorage.getItem('accessToken');

  useEffect(() => {
    initialize(page, rowsPerPage, filterName);
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await axios.get('/api/bellbank/banks', {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });
      if (data.data?.status === 'success') {
        setBankList(data.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const initialize = async (pag, adex = 5, search) => {
    let adex_page;
    if (pag > page) {
      adex_page = pag + 1;
    } else {
      adex_page = pag;
    }
    SetLoad(true);
    try {
      const data = await axios.get(`/api/admin/bellbank/transfers?page=${adex_page}&per_page=${adex}&search=${search || ''}`, {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });

      if (data.data?.status === 'success') {
        setTransferList(data.data?.data?.data || []);
        SetTotal(data.data?.data?.total || 0);
        SetNotFound((data.data?.data?.total || 0) === 0);
      } else {
        setTransferList([]);
        SetTotal(0);
        SetNotFound(true);
      }
      SetLoad(false);
      setPage(pag);
    } catch (error) {
      SetLoad(false);
      setTransferList([]);
      SetTotal(0);
      SetNotFound(true);
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    }
  };

  const handleCreateTransfer = async () => {
    if (!transferForm.beneficiary_bank_code || !transferForm.beneficiary_account_number || !transferForm.amount || !transferForm.narration) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }

    setTransferLoading(true);
    try {
      const data = await axios.post(
        '/api/bellbank/transfer',
        transferForm,
        {
          headers: { Authorization: `Bearer ${AccessToken}` }
        }
      );

      if (data.data?.status === 'success') {
        enqueueSnackbar('Transfer initiated successfully', { variant: 'success' });
        setOpenDialog(false);
        setTransferForm({
          beneficiary_bank_code: '',
          beneficiary_account_number: '',
          amount: '',
          narration: '',
        });
        initialize(page, rowsPerPage, filterName);
      } else {
        enqueueSnackbar(data.data?.message || 'Transfer failed', { variant: 'error' });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Transfer failed', { variant: 'error' });
      }
    } finally {
      setTransferLoading(false);
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
    <Page title="BellBank: Transfers">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="BellBank Transfers"
          links={[
            { name: 'Dashboard', href: PATH_ADMIN.root },
            { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
            { name: 'Transfers' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon={'eva:plus-fill'} />}
              onClick={() => setOpenDialog(true)}
            >
              New Transfer
            </Button>
          }
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
                    {transferList.map((row) => {
                      const { id, reference, user, amount, destination_account_number, destination_bank_name, description, status, created_at } = row;
                      return (
                        <TableRow hover key={id} tabIndex={-1}>
                          <TableCell>{reference || 'N/A'}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" noWrap>
                              {user?.username || user?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="left">₦{fCurrency(amount || 0)}</TableCell>
                          <TableCell align="left">
                            {destination_account_number || 'N/A'}
                            {destination_bank_name && ` (${destination_bank_name})`}
                          </TableCell>
                          <TableCell align="left">{description || 'N/A'}</TableCell>
                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={status === 'success' ? 'success' : status === 'pending' ? 'warning' : 'error'}
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
                    <TableCell align="center" colSpan={7} sx={{ py: 3 }}>
                      <Typography variant="body2">Loading ...</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {isNotFound && !load && (
                  <TableRow>
                    <TableCell align="center" colSpan={7} sx={{ py: 3 }}>
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Transfer</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Bank"
                value={transferForm.beneficiary_bank_code}
                onChange={(e) => setTransferForm({ ...transferForm, beneficiary_bank_code: e.target.value })}
              >
                {bankList.map((bank) => (
                  <MenuItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Account Number"
                value={transferForm.beneficiary_account_number}
                onChange={(e) => setTransferForm({ ...transferForm, beneficiary_account_number: e.target.value })}
                placeholder="Enter beneficiary account number"
              />

              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                placeholder="Enter amount"
              />

              <TextField
                fullWidth
                label="Narration"
                value={transferForm.narration}
                onChange={(e) => setTransferForm({ ...transferForm, narration: e.target.value })}
                placeholder="Enter transfer narration"
                multiline
                rows={3}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <LoadingButton
              variant="contained"
              loading={transferLoading}
              onClick={handleCreateTransfer}
            >
              Initiate Transfer
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
}

