<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PricingSetting;
use App\Models\Package;
use Illuminate\Http\Request;

class PricingSettingController extends Controller
{
    public function index()
    {
        $setting = PricingSetting::firstOrCreate([], [
            'shells_1300_price' => 0,
            'markup_normal' => 0,
            'markup_silver' => 0,
            'markup_gold' => 0,
            'markup_type' => 'percent'
        ]);
        
        return view('admin.pricing.index', compact('setting'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'shells_1300_price' => 'required|numeric|min:0',
            'markup_type' => 'required|in:fixed,percent',
            'markup_normal' => 'required|numeric|min:0',
            'markup_silver' => 'required|numeric|min:0',
            'markup_gold' => 'required|numeric|min:0',
        ]);

        $setting = PricingSetting::first();
        if ($setting) {
            $setting->update($validated);
        } else {
            PricingSetting::create($validated);
        }

        // Recalculate all active packages
        $packages = Package::all();
        foreach ($packages as $package) {
            $prices = PricingSetting::calculatePrice($package->shell_cost);
            $package->update([
                'normal_price' => $prices['normal'],
                'silver_price' => $prices['silver'],
                'gold_price' => $prices['gold'],
            ]);
        }

        return redirect()->route('admin.pricing.index')->with('success', 'Pricing settings updated and all packages recalculated.');
    }
}
