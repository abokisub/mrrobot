/* eslint-disable react-hooks/exhaustive-deps */
import { sentenceCase, capitalCase } from 'change-case';
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
// sections
import { UserListToolbar } from '../../../sections/admin/user/list';
// format number 
import { fCurrency } from '../../../utils/formatNumber';
// axios
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'user', label: 'User', alignRight: false },
  { id: 'account_number', label: 'Account Number', alignRight: false },
  { id: 'bank_name', label: 'Bank Name', alignRight: false },
  { id: 'currency', label: 'Currency', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'created_at', label: 'Created Date', alignRight: false },
];

const ACCOUNT_TABS = [
  {
    value: 'ALL',
    label: 'ALL'
  },
  {
    value: 1,
    label: 'Active'   
  },
  {
    value: 2,
    label: 'Banned'
  },
  {
    value: 3,
    label: 'Deactivated'
  },
  {
    value: 0,
    label: 'Unverified'
  },
];

// ----------------------------------------------------------------------

export default function BellBankAccounts() {
  const { themeStretch } = useSettings();
  const [accountList, setAccountList] = useState([]);
  const [page, setPage] = useState(0);
  const [load, SetLoad] = useState(true);
  const [totalPage, SetTotal] = useState(0);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, SetDense] = useState(false);
  const [role, setRole] = useState('ALL');
  const [isNotFound, SetNotFound] = useState(false);
  const [status, setStatus] = useState('ALL');
  const { enqueueSnackbar } = useSnackbar();
  const AccessToken = window.localStorage.getItem('accessToken');

  useEffect(() => {
    initialize(page, rowsPerPage, status, filterName, role);
  }, []);

  const initialize = async (pag, adex = 5, status, search, role) => {
    let adex_page;
    if (pag > page) {
      adex_page = pag + 1;
    } else {
      adex_page = pag;
    }
    SetLoad(true);
    try {
      const statusParam = status === 'ALL' ? '' : `&status=${status}`;
      const roleParam = role === 'ALL' ? '' : `&role=${role}`;
      const data = await axios.get(`/api/admin/bellbank/accounts/${AccessToken}/secure?page=${adex_page}&per_page=${adex}${statusParam}${roleParam}&search=${search || ''}`);

      if (data.data?.status === 'success') {
        setAccountList(data.data?.data?.data || []);
        SetTotal(data.data?.data?.total || 0);
        SetNotFound((data.data?.data?.total || 0) === 0);
      } else {
        setAccountList([]);
        SetTotal(0);
        SetNotFound(true);
      }
      SetLoad(false);
      setPage(pag);
    } catch (error) {
      SetLoad(false);
      setAccountList([]);
      SetTotal(0);
      SetNotFound(true);
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      }
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    initialize(0, event.target.value, status, filterName, role);
    setPage(0);
  };

  const handleFilterByName = async (filterName) => {
    setFilterName(filterName);
    setPage(0);
    if (filterName) {
      initialize(page, rowsPerPage, status, filterName, role);
    } else {
      initialize(page, rowsPerPage, status, filterName, role);
      SetNotFound(false);
      SetLoad(false);
    }
  };

  const handlerole = (role) => {
    setRole(role);
    setPage(0);
    initialize(0, rowsPerPage, status, filterName, role);
  };

  function handleChangeDense(event) {
    SetDense(event.target.checked);
  }

  return (
    <Page title="BellBank: Virtual Accounts">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="BellBank Virtual Accounts"
          links={[
            { name: 'Dashboard', href: PATH_ADMIN.root },
            { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
            { name: 'Virtual Accounts' },
          ]}
        />

        <Card>
          <Tabs
            value={status}
            scrollButtons="auto"
            variant="scrollable"
            allowScrollButtonsMobile
            onChange={(e, value) => {setStatus(value); initialize(page, rowsPerPage, value, filterName, role); }}
          >
            {ACCOUNT_TABS.map((tab) => (
              <Tab disableRipple key={tab.value} label={capitalCase(tab.label)} value={tab.value} />
            ))}
          </Tabs>
          <UserListToolbar
            numSelected={0}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onDeleteUsers={() => {}}
            onRoleUsers={handlerole}
          />
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
                    {accountList.map((row) => {
                      const { id, user, account_number, bank_name, currency, status, created_at } = row;
                      return (
                        <TableRow hover key={id} tabIndex={-1}>
                          <TableCell>
                            <Typography variant="subtitle2" noWrap>
                              {user?.username || user?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="left">{account_number || 'N/A'}</TableCell>
                          <TableCell align="left">{bank_name || 'BellBank'}</TableCell>
                          <TableCell align="left">{currency || 'NGN'}</TableCell>
                          <TableCell align="left">
                            <Label
                              variant="ghost"
                              color={user?.status === 1 ? 'success' : user?.status === 0 ? 'warning' : 'error'}
                            >
                              {sentenceCase((user?.status === 0 && 'unverified') || (user?.status === 1 && 'active') || (user?.status === 2 && 'banned') || (user?.status === 3 && 'deactivated') || 'N/A')}
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
                    <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                      <Typography variant="body2">Loading ...</Typography>
                    </TableCell>
                  </TableRow>
                )}
                {isNotFound && !load && (
                  <TableRow>
                    <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
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
            onPageChange={(e, page) => initialize(page, rowsPerPage, status, filterName, role)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

