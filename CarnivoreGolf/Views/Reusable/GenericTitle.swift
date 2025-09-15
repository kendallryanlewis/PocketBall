//
//  GenericTitle.swift
//  CarnivoreGolf
//
//  Created by Kendall Lewis on 9/9/25.
//

import SwiftUI

struct GenericTitle: View {
    let title: String
    
    var body: some View {
        Text(title)
            .font(.system(size: 13, weight: .medium, design: .default))
            .foregroundColor(.secondary)
            .textCase(.uppercase)
            .kerning(2)
    }
}
