<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class  PlanController extends Controller
{

    public function DataPlan(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            if (!empty($request->id)) {
                $check_user = DB::table('user')->where(['status' => 1, 'id' => $this->verifytoken($request->id)]);
                if ($check_user->count() == 1) {
                    $adex = $check_user->first();

                    // validate form
                    $main_validator = validator::make($request->all(), [
                        'network' => 'required',
                        'network_type' => 'required',
                    ]);
                    // validate user type
                    if ($adex->type == 'SMART') {
                        $user_type = 'smart';
                    } else if ($adex->type == 'AGENT') {
                        $user_type = 'agent';
                    } else if ($adex->type == 'AWUF') {
                        $user_type = 'awuf';
                    } else if ($adex->type == 'API') {
                        $user_type = 'api';
                    } else {
                        $user_type = 'special';
                    }
                    if ($main_validator->fails()) {
                        return response()->json([
                            'message' => $main_validator->errors()->first(),
                            'status' => 403
                        ])->setStatusCode(403);
                    } else {
                        $get_network = DB::table('network')->where('plan_id', $request->network)->first();
                        if (!$get_network) {
                            return response()->json([
                                'status' => 'fail',
                                'message' => 'Network not found'
                            ])->setStatusCode(404);
                        }
                        $all_plan = DB::table('data_plan')->where(['network' => $get_network->network, 'plan_type' => $request->network_type, 'plan_status' => 1]);
                        $data_plan = [];
                        if ($all_plan->count() > 0) {
                            foreach ($all_plan->get() as $adex => $plan) {
                                $data_plan[] =  ['name' => $plan->plan_name . $plan->plan_size . ' ' . $plan->plan_type . ' = ₦' . number_format($plan->$user_type, 2) . ' ' . $plan->plan_day, 'plan_id' => $plan->plan_id, 'amount' => $plan->$user_type];
                            }
                        }
                        return response()->json([
                            'status' => 'success',
                            'plan' => $data_plan
                        ]);
                    }
                } else {
                    return response()->json([
                        'status' => 403,
                        'message' => 'Not Authorised'
                    ])->setStatusCode(403);
                }
            } else {
                return redirect(config('adex.error_500', '/500'));
            }
        } else {
            return redirect(config('adex.error_500', '/500'));
        }
    }
    public function CablePlan(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            if (isset($request->id)) {
                $cable_name = DB::table('cable_id')->where('plan_id', $request->id)->first();
                return response()->json([
                    'status' => 'suucess',
                    'plan' => DB::table('cable_plan')->where(['cable_name' => $cable_name->cable_name, 'plan_status' => 1])->select('cable_name', 'plan_name', 'plan_price', 'plan_id')->get()
                ]);
            }
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }
    public function CableCharges(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            if (isset($request->id)) {
                if (DB::table('cable_plan')->where('plan_id', $request->id)->count() == 1) {
                    $cable = DB::table('cable_plan')->where('plan_id', $request->id)->first();
                    $amount = $cable->plan_price;
                    $cable_name = strtolower($cable->cable_name);
                    $cable_setting = DB::table('cable_charge')->first();
                    if ($cable_setting->direct == 1) {
                        $charges = $cable_setting->$cable_name;
                    } else {
                        $charges = ($amount / 100) * $cable_setting->$cable_name;
                    }
                    return response()->json([
                        'status' => 'suucess',
                        'amount' => $amount,
                        'charges' => $charges
                    ]);
                } else {
                    return response()->json([
                        'status' => 403,
                        'message' => 'Unable to calculate'
                    ])->setStatusCode(403);
                }
            }
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }
    public function DataList(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            if (!empty($request->id)) {
                $check_user = DB::table('user')->where(['status' => 1, 'id' => $this->verifytoken($request->id)]);
                if ($check_user->count() == 1) {
                    $adex = $check_user->first();
                    // validate user type
                    if ($adex->type == 'SMART') {
                        $user_type = 'smart';
                    } else if ($adex->type == 'AGENT') {
                        $user_type = 'agent';
                    } else if ($adex->type == 'AWUF') {
                        $user_type = 'awuf';
                    } else if ($adex->type == 'API') {
                        $user_type = 'api';
                    } else {
                        $user_type = 'special';
                    }


                    $all_plan = DB::table('data_plan')->where(['plan_status' => 1]);
                    if ($all_plan->count() > 0) {
                        foreach ($all_plan->get() as $adex => $plan) {
                            $data_plan[] =  ['plan_name' => $plan->plan_name . $plan->plan_size, 'plan_id' => $plan->plan_id, 'amount' => number_format($plan->$user_type, 2), 'plan_type' => $plan->plan_type, 'plan_day' => $plan->plan_day, 'network' => $plan->network];;
                        }
                    } else {
                        $data_plan = [];
                    }
                    return response()->json([
                        'status' => 'success',
                        'plan' => $data_plan
                    ]);
                } else {
                    return response()->json([
                        'status' => 403,
                        'message' => 'Not Authorised'
                    ])->setStatusCode(403);
                }
            } else {
                return redirect(config('adex.error_500', '/500'));
                return response()->json([
                    'status' => 403,
                    'message' => 'Unable to Authenticate System'
                ])->setStatusCode(403);
            }
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }
    public function CableList(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {




            return response()->json([
                'status' => 'success',
                'plan' => DB::table('cable_plan')->where('plan_status', 1)->select('cable_name', 'plan_name', 'plan_price', 'plan_id')->get()
            ]);
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }
    public function DiscoList(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {




            return response()->json([
                'status' => 'success',
                'plan' => DB::table('bill_plan')->where('plan_status', 1)->select('disco_name', 'plan_id')->get()
            ]);
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }

    public function ExamList(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            $exam_list = [];
            $exam_id = DB::table('exam_id')->get();
            $exam_price = DB::table('result_charge')->first();
            foreach ($exam_id as $exam) {
                if ($exam->exam_name == 'WAEC') {
                    $exam_list[] = ['exam_name' => $exam->exam_name, 'plan_id' => $exam->plan_id, 'amount' => '₦' . number_format($exam_price->waec, 2)];
                }
                if ($exam->exam_name == 'NECO') {
                    $exam_list[] = ['exam_name' => $exam->exam_name, 'plan_id' => $exam->plan_id, 'amount' => '₦' . number_format($exam_price->neco, 2)];
                }

                if ($exam->exam_name == 'NABTEB') {
                    $exam_list[] = ['exam_name' => $exam->exam_name, 'plan_id' => $exam->plan_id, 'amount' => '₦' . number_format($exam_price->nabteb, 2)];
                }
            }
            return response()->json([
                'status' => 'success',
                'plan' => $exam_list
            ]);
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }
    public function HomeData(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            return response()->json([
                'status' => 'success',
                'mtn' => DB::table('data_plan')->where(['network' => 'MTN', 'plan_status' => 1])->select('plan_name', 'network', 'plan_size', 'plan_day', 'smart')->orderBy('smart', 'asc')->get(),
                'glo' => DB::table('data_plan')->where(['network' => 'GLO', 'plan_status' => 1])->select('plan_name', 'network', 'plan_size', 'plan_day', 'smart')->orderBy('smart', 'asc')->get(),
                'airtel' => DB::table('data_plan')->where(['network' => 'AIRTEL', 'plan_status' => 1])->select('plan_name', 'network', 'plan_size', 'plan_day', 'smart')->orderBy('smart', 'asc')->get(),
                'mobile' => DB::table('data_plan')->where(['network' => '9MOBILE', 'plan_status' => 1])->select('plan_name', 'network', 'plan_size', 'plan_day', 'smart')->orderBy('smart', 'asc')->get()
            ]);
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }

    public function DataCard(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            if (!empty($request->id)) {
                $check_user = DB::table('user')->where(['status' => 1, 'id' => $this->verifytoken($request->id)]);
                if ($check_user->count() == 1) {
                    $adex = $check_user->first();
                    // validate user type
                    if ($adex->type == 'SMART') {
                        $user_type = 'smart';
                    } else if ($adex->type == 'AGENT') {
                        $user_type = 'agent';
                    } else if ($adex->type == 'AWUF') {
                        $user_type = 'awuf';
                    } else if ($adex->type == 'API') {
                        $user_type = 'api';
                    } else {
                        $user_type = 'special';
                    }


                    $all_plan = DB::table('data_card_plan')->where(['plan_status' => 1]);
                    if ($all_plan->count() > 0) {
                        foreach ($all_plan->get() as $adex => $plan) {
                            $data_plan[] =  ['plan_name' => $plan->name . $plan->plan_size, 'plan_id' => $plan->plan_id, 'amount' => number_format($plan->$user_type, 2), 'plan_type' => $plan->plan_type, 'plan_day' => $plan->plan_day, 'network' => $plan->network, 'load_pin' => $plan->load_pin, 'check_balance' => $plan->check_balance];;
                        }
                    } else {
                        $data_plan = [];
                    }
                    return response()->json([
                        'status' => 'success',
                        'plan' => $data_plan
                    ]);
                } else {
                    return response()->json([
                        'status' => 403,
                        'message' => 'Not Authorised'
                    ])->setStatusCode(403);
                }
            } else {
                return redirect(config('adex.error_500', '/500'));
                return response()->json([
                    'status' => 403,
                    'message' => 'Unable to Authenticate System'
                ])->setStatusCode(403);
            }
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }

    public function RechargeCard(Request $request)
    {
        $allowedOrigins = array_filter(array_map('trim', explode(',', config('adex.app_key', ''))));
        $origin = $request->headers->get('origin');
        $originNormalized = rtrim($origin ?: '', '/');
        
        if (in_array($originNormalized, $allowedOrigins) || config('adex.device_key') === $request->header('Authorization')) {
            if (!empty($request->id)) {
                $check_user = DB::table('user')->where(['status' => 1, 'id' => $this->verifytoken($request->id)]);
                if ($check_user->count() == 1) {
                    $adex = $check_user->first();
                    // validate user type
                    if ($adex->type == 'SMART') {
                        $user_type = 'smart';
                    } else if ($adex->type == 'AGENT') {
                        $user_type = 'agent';
                    } else if ($adex->type == 'AWUF') {
                        $user_type = 'awuf';
                    } else if ($adex->type == 'API') {
                        $user_type = 'api';
                    } else {
                        $user_type = 'special';
                    }


                    $all_plan = DB::table('recharge_card_plan')->where(['plan_status' => 1]);
                    if ($all_plan->count() > 0) {
                        foreach ($all_plan->get() as $adex => $plan) {
                            $data_plan[] =  ['name' => $plan->name, 'plan_id' => $plan->plan_id, 'amount' => number_format($plan->$user_type, 2),  'network' => $plan->network, 'load_pin' => $plan->load_pin, 'check_balance' => $plan->check_balance];;
                        }
                    } else {
                        $data_plan = [];
                    }
                    return response()->json([
                        'status' => 'success',
                        'plan' => $data_plan
                    ]);
                } else {
                    return response()->json([
                        'status' => 403,
                        'message' => 'Not Authorised'
                    ])->setStatusCode(403);
                }
            } else {
                return redirect(config('adex.error_500', '/500'));
                return response()->json([
                    'status' => 403,
                    'message' => 'Unable to Authenticate System'
                ])->setStatusCode(403);
            }
        } else {
            return redirect(config('adex.error_500', '/500'));
            return response()->json([
                'status' => 403,
                'message' => 'Unable to Authenticate System'
            ])->setStatusCode(403);
        }
    }
}
