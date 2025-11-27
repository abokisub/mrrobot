<?php

use App\Http\Controllers\API\PaymentController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {

    $general = DB::table('general')->first();
    $mtn = DB::table('data_plan')
        ->where(['network' => 'MTN', 'plan_status' => 1])
        ->orderBy('id', 'asc')
        ->get();

    $glo = DB::table('data_plan')
        ->where(['network' => 'GLO', 'plan_status' => 1])
        ->get();
    $mobile = DB::table('data_plan')
        ->where(['network' => '9MOBILE', 'plan_status' => 1])
        ->get();
    $airtel = DB::table('data_plan')
        ->where(['network' => 'AIRTEL', 'plan_status' => 1])
        ->get();

    return view('index', [
        'general' => $general,
        'mtn' => $mtn,
        'airtel' => $airtel,
        'glo' => $glo,
        'mobile' => $mobile
    ]);
});
Route::any('vdf_auto_fund_adex', [PaymentController::class, 'VDFWEBHOOK']);

Route::get('/cache', function () {
    return
        Cache::flush();
});
