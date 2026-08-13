<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\PricingSetting;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::latest()->get();
        return view('admin.packages.index', compact('packages'));
    }

    public function create()
    {
        return view('admin.packages.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_name' => 'required|string|max:255',
            'package_type' => 'required|in:diamond,membership',
            'diamond_amount' => 'nullable|integer|min:0',
            'shell_cost' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $prices = PricingSetting::calculatePrice($validated['shell_cost']);
        
        $validated['normal_price'] = $prices['normal'];
        $validated['silver_price'] = $prices['silver'];
        $validated['gold_price'] = $prices['gold'];

        Package::create($validated);

        return redirect()->route('admin.packages.index')->with('success', 'Package created successfully.');
    }

    public function edit(Package $package)
    {
        return view('admin.packages.edit', compact('package'));
    }

    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'package_name' => 'required|string|max:255',
            'package_type' => 'required|in:diamond,membership',
            'diamond_amount' => 'nullable|integer|min:0',
            'shell_cost' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $prices = PricingSetting::calculatePrice($validated['shell_cost']);
        
        $validated['normal_price'] = $prices['normal'];
        $validated['silver_price'] = $prices['silver'];
        $validated['gold_price'] = $prices['gold'];

        $package->update($validated);

        return redirect()->route('admin.packages.index')->with('success', 'Package updated successfully.');
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return redirect()->route('admin.packages.index')->with('success', 'Package deleted successfully.');
    }
}
