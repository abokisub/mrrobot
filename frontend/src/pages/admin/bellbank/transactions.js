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
  Tabs,
  Tab,
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
// format number 
import { fCurrency } from '../../../utils/formatNumber';
// axios
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'reference', label: 'Reference', alignRight: false },
  { id: 'user', label: 'User', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'description', label: 'Description', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'created_at', label: 'Date', alignRight: false },
];

const STATUS_TABS = [
  { value: 'ALL', label: 'ALL' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

// ----------------------------------------------------------------------

export default function BellBankTransactions() {
  const { themeStretch } = useSettings();
  const [transactionList, setTransactionList] = useState([]);
  const [page, setPage] = useState(0);
  const [load, SetLoad] = useState(true);
  const [totalPage, SetTotal] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, SetDense] = useState(false);
  const [isNotFound, SetNotFound] = useState(false);
  const [status, setStatus] = useState('ALL');
  const { enqueueSnackbar } = useSnackbar();
  const AccessToken = window.localStorage.getItem('accessToken');

  useEffect(() => {
    initialize(page, rowsPerPage, status, filterName);
  }, []);

  const initialize = async (pag, adex = 5, status, search) => {
    let adex_page;
    if (pag > page) {
      adex_page = pag + 1;
    } else {
      adex_page = pag;
    }
    SetLoad(true);
    try {
      const statusParam = status === 'ALL' ? '' : `&status=${status}`;
      const data = await axios.get(`/api/admin/bellbank/transactions?page=${adex_page}&per_page=${adex}${statusParam}&search=${search || ''}`, {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });

      if (data.data?.status === 'success') {
        setTransactionList(data.data?.data?.data || []);
        SetTotal(data.data?.data?.total || 0);
        SetNotFound((data.data?.data?.total || 0) === 0);
      } else {
        setTransactionList([]);
        SetTotal(0);
        SetNotFound(true);
      }
      SetLoad(false);
      setPage(pag);
    } catch (error) {
      SetLoad(false);
      setTransactionList([]);
      SetTotal(0);
      SetNotFound(true);
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    initialize(0, event.target.value, status, filterName);
    setPage(0);
  };

  const handleFilterByName = async (filterName) => {
    setFilterName(filterName);
    setPage(0);
    initialize(0, rowsPerPage, status, filterName);
  };

  const handleStatusChange = (e, value) => {
    setStatus(value);
    initialize(0, rowsPerPage, value, filterName);
  };

  function handleChangeDense(event) {
    SetDense(event.target.checked);
  }

  return (
    <Page title="BellBank: Transactions">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="BellBank Transactions"
          links={[
            { name: 'Dashboard', href: PATH_ADMIN.root },
            { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
            { name: 'Transactions' },
          ]}
        />

        <Card>
          <Tabs
            value={status}
            scrollButtons="auto"
            variant="scrollable"
            allowScrollButtonsMobile
            onChange={handleStatusChange}
          >
            {STATUS_TABS.map((tab) => (
              <Tab disableRipple key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>

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
                    {transactionList.map((row) => {
                      const { id, reference, user, type, amount, description, status, created_at } = row;
                      return (
                        <TableRow hover key={id} tabIndex={-1}>
                          <TableCell>{reference || 'N/A'}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" noWrap>
                              {user?.username || user?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{type || 'N/A'}</TableCell>
                          <TableCell align="left">₦{fCurrency(amount || 0)}</TableCell>
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
            onPageChange={(e, page) => initialize(page, rowsPerPage, status, filterName)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

