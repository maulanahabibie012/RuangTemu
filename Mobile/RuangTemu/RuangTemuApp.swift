//
//  RuangTemuApp.swift
//  RuangTemu
//
//  Created by ITQA on 15/07/26.
//

import SwiftUI
import CoreData

@main
struct RuangTemuApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
